import { Request, Response } from 'express';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import {
  Booking,
  BookingInterface,
  isBookingInterface,
} from '../models/booking.model';
import '../utils/array_extensions';
import { boundClass } from 'autobind-decorator';
import { Timeslot } from '../models/timeslot.model';

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
    const bookings = await Booking.findAll<Booking>({
      include: [Timeslot],
    });

    res.json(await BookingsController.validateBookings(bookings));
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

  public async update(req: Request, res: Response) {
    const bookingData = BookingsController.retrieveBookingData(req, res);

    if (bookingData != null) {
      const update: UpdateOptions = {
        where: { id: req.params.id },
        limit: 1,
      };

      try {
        await Booking.update(bookingData, update);

        res.status(202).json({ data: 'success' });
      } catch (error) {
        res.status(500).json(error);
      }
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
  ): BookingInterface | null {
    const timeslotData = req.body;
    if (isBookingInterface(timeslotData)) {
      return timeslotData;
    } else {
      res.status(500).json({ errors: ['Invalid booking format.'] });
      return null;
    }
  }
}
