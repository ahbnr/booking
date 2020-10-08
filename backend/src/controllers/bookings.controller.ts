import { Request, Response } from 'express';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import {
  Booking,
  BookingInterface,
  BookingPostInterface,
} from '../models/booking.model';
import '../utils/array_extensions';
import { boundClass } from 'autobind-decorator';
import { Timeslot } from '../models/timeslot.model';
import { EMail, validateJson } from '../utils/typechecking';
import { sendMail } from '../utils/email';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/passport';
import * as t from 'io-ts';
import { TimeslotsController } from './timeslots.controller';
import { asyncJwtSign, asyncJwtVerify } from '../utils/jwt';
import validate = WebAssembly.validate;

const BookingLookupTokenData = t.type({
  type: t.literal('BookingLookupToken'),
  email: EMail,
});

type BookingLookupToken = t.TypeOf<typeof BookingLookupTokenData>;

@boundClass
export class BookingsController {
  public static async validateBookings(
    bookings: Booking[]
  ): Promise<Booking[]> {
    const [
      old_bookings,
      valid_bookings,
    ] = await bookings.asyncPartition((booking) => booking.hasPassed());

    for (const booking of old_bookings) {
      await booking.destroy();
    }

    return valid_bookings;
  }

  public async index(req: Request, res: Response) {
    const lookupToken = req.query.token;

    if (lookupToken != null && typeof lookupToken === 'string') {
      res.json(await this.listBookingsByLookupToken(lookupToken));
    } else if (req.authenticated) {
      const bookings = await Booking.findAll<Booking>({
        include: [Timeslot],
      });

      res.json(await BookingsController.validateBookings(bookings));
    } else {
      res.status(401).json();
    }
  }

  public async show(req: Request, res: Response) {
    try {
      let booking = await Booking.findByPk<Booking>(req.params.id, {
        include: [Timeslot],
      });

      if (booking != null && (await booking.hasPassed())) {
        await booking.destroy();
        booking = null;
      }

      if (booking != null) {
        res.json(booking);
      } else {
        res.status(404).json({ errors: ['Booking not found'] });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async createBooking(req: Request, res: Response) {
    const timeslot = await TimeslotsController.getTimeslot(req, res);
    const bookingPostData = validateJson(BookingPostInterface, req.body);

    const booking = await Booking.create<Booking>({
      timeslotId: timeslot.id,
      ...bookingPostData,
    });

    await this.sendBookingLookupMail(bookingPostData.lookupUrl, booking);

    res.status(201).json(booking);
  }

  private async createBookingLookupToken(booking: Booking): Promise<string> {
    const email = validateJson(EMail, booking.email);
    const validDuration = await booking.timeTillDue();

    const data: BookingLookupToken = {
      type: 'BookingLookupToken',
      email: email,
    };

    const lookupToken = await asyncJwtSign(data, jwtSecret, {
      expiresIn: validDuration.seconds,
    });

    return lookupToken;
  }

  private async sendBookingLookupMail(lookupUrl: string, booking: Booking) {
    const lookupToken = await this.createBookingLookupToken(booking);

    await sendMail(
      booking.email,
      'Ihre Buchung',
      '', // TODO text representation
      `<a href="${lookupUrl}?lookupToken=${lookupToken}">Einsehen</a>`
    );
  }

  private async listBookingsByLookupToken(
    lookupToken: string
  ): Promise<Booking[]> {
    const verifiedToken = await asyncJwtVerify(lookupToken, jwtSecret);

    const tokenData = validateJson(BookingLookupTokenData, verifiedToken);

    const bookings = await Booking.findAll({
      where: { email: tokenData.email },
    });

    return bookings;
  }

  public async update(req: Request, res: Response) {
    const bookingPostData = validateJson(BookingPostInterface, req.body);

    const update: UpdateOptions = {
      where: { id: req.params.id },
      limit: 1,
    };

    try {
      const [_, [booking]] = await Booking.update(bookingPostData, update);

      await this.sendBookingLookupMail(bookingPostData.lookupUrl, booking);

      res.status(202).json({ data: 'success' });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async delete(req: Request, res: Response) {
    const options: DestroyOptions = {
      where: { id: req.params.id },
      limit: 1,
    };

    try {
      await Booking.destroy(options);

      res.status(204).json({ data: 'success' });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public static retrieveBookingData(
    req: Request,
    res: Response
  ): BookingInterface {
    const bookingData = validateJson(BookingInterface, req.body);

    return bookingData;
  }
}
