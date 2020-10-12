import { Request, Response } from 'express';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import { Booking } from '../models/booking.model';
import '../utils/array_extensions';
import { boundClass } from 'autobind-decorator';
import { Timeslot } from '../models/timeslot.model';
import { sendMail } from '../utils/email';
import { jwtSecret } from '../config/passport';
import { TimeslotsController } from './timeslots.controller';
import { asyncJwtSign, asyncJwtVerify } from '../utils/jwt';
import {
  BookingGetInterface,
  BookingPostInterface,
  checkType,
  EMailString,
} from 'common';
import { noRefinementChecks } from 'common/dist';
import { BookingLookupTokenData } from '../types/token-types/BookingLookupTokenData';

@boundClass
export class BookingsController {
  public static async clearPastBookings(
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

  public async index(req: Request, res: Response<BookingGetInterface[]>) {
    const lookupToken = req.query.token;

    if (lookupToken != null && typeof lookupToken === 'string') {
      const result: BookingGetInterface[] = noRefinementChecks<
        BookingGetInterface[]
      >(await BookingsController.listBookingsByLookupToken(lookupToken));

      res.json(result);
    } else if (req.authenticated) {
      const bookings = await Booking.findAll<Booking>({
        include: [Timeslot],
      });

      res.json(
        noRefinementChecks<BookingGetInterface[]>(
          (
            await BookingsController.clearPastBookings(bookings)
          ).map((booking) => booking.toTypedJSON())
        )
      );
    } else {
      res.status(401).json();
    }
  }

  public async show(req: Request, res: Response<BookingGetInterface>) {
    try {
      let booking = await Booking.findByPk<Booking>(req.params.id, {
        include: [Timeslot],
      });

      if (booking != null && (await booking.hasPassed())) {
        await booking.destroy();
        booking = null;
      }

      if (booking != null) {
        res.json(
          noRefinementChecks<BookingGetInterface>(booking.toTypedJSON())
        );
      } else {
        res.status(404).json();
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async createBooking(
    req: Request,
    res: Response<BookingGetInterface | string>
  ) {
    const timeslot = await TimeslotsController.getTimeslot(req);
    const bookings = await BookingsController.clearPastBookings(
      await timeslot.lazyBookings
    );

    if (bookings.length < timeslot.capacity) {
      const bookingPostData = checkType(req.body, BookingPostInterface);

      const booking = await Booking.create<Booking>({
        timeslotId: timeslot.id,
        ...bookingPostData,
      });

      await BookingsController.sendBookingLookupMail(
        bookingPostData.lookupUrl,
        booking
      );

      res
        .status(201)
        .json(noRefinementChecks<BookingGetInterface>(booking.toTypedJSON()));
    } else {
      res
        .status(409)
        .json(
          'Maximum capacity of this timeslot has been reached. No more bookings can be created for it.'
        );
    }
  }

  private static async createBookingLookupToken(
    booking: Booking
  ): Promise<string> {
    const email = checkType(booking.email, EMailString);
    const validDuration = await booking.timeTillDue();
    const secondsUntilExpiration = Math.floor(
      validDuration.shiftTo('seconds').seconds
    );

    const data: BookingLookupTokenData = {
      type: 'BookingLookupToken',
      email: email,
    };

    return await asyncJwtSign(data, jwtSecret, {
      expiresIn: secondsUntilExpiration,
    });
  }

  private static async sendBookingLookupMail(
    lookupUrl: string,
    booking: Booking
  ) {
    const lookupToken = await BookingsController.createBookingLookupToken(
      booking
    );

    await sendMail(
      booking.email,
      'Ihre Buchung',
      '', // TODO text representation
      `<a href="${lookupUrl}?lookupToken=${lookupToken}">Einsehen</a>`
    );
  }

  private static async listBookingsByLookupToken(
    lookupToken: string
  ): Promise<Booking[]> {
    const verifiedToken = await asyncJwtVerify(lookupToken, jwtSecret);

    const tokenData = checkType(verifiedToken, BookingLookupTokenData);

    return Booking.findAll({
      where: { email: tokenData.email },
    });
  }

  private static async getBookingByToken(
    bookingId: number,
    lookupToken: string
  ): Promise<Booking | null> {
    const verifiedToken = await asyncJwtVerify(lookupToken, jwtSecret);

    const tokenData = checkType(verifiedToken, BookingLookupTokenData);

    const matchingBookings = await Booking.findAll({
      where: { id: bookingId, email: tokenData.email },
    });

    if (matchingBookings.length > 0) {
      return matchingBookings[0];
    } else {
      return null;
    }
  }

  public async update(req: Request, res: Response) {
    const bookingPostData = checkType(req.body, BookingPostInterface);

    const update: UpdateOptions = {
      where: { id: req.params.id },
      limit: 1,
    };

    try {
      // noinspection JSUnusedLocalSymbols
      const [_, [booking]] = await Booking.update(bookingPostData, update); // eslint-disable-line @typescript-eslint/no-unused-vars

      await BookingsController.sendBookingLookupMail(
        bookingPostData.lookupUrl,
        booking
      );

      res.status(202).json({ data: 'success' });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async delete(req: Request, res: Response) {
    const bookingId = parseInt(req.params.id);
    const lookupToken = req.query.token;

    if (lookupToken != null && typeof lookupToken === 'string') {
      const maybeBooking = await BookingsController.getBookingByToken(
        bookingId,
        lookupToken
      );

      if (maybeBooking != null) {
        await maybeBooking.destroy();

        res.status(204).json();
      } else {
        res.status(404).json();
      }
    } else if (req.authenticated) {
      const options: DestroyOptions = {
        where: { id: req.params.id },
        limit: 1,
      };

      await Booking.destroy(options);

      res.status(204).json({ data: 'success' });
    } else {
      res.status(401).json();
    }
  }
}
