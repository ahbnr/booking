import { Request, Response } from 'express';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import {
  isTimeslotInterface,
  Timeslot,
  TimeslotInterface,
} from '../models/timeslot.model';
import { ControllerError } from './errors';
import { boundClass } from 'autobind-decorator';
import { Booking } from '../models/booking.model';
import { BookingsController } from './bookings.controller';
import { Weekday } from '../models/weekday.model';

@boundClass
export class TimeslotsController {
  public async index(req: Request, res: Response) {
    const timeslots = await Timeslot.findAll<Timeslot>({});

    res.json(timeslots);
  }

  public async show(req: Request, res: Response) {
    const timeslot = await this.getTimeslot(req, res);

    res.json(timeslot);
  }

  public async getBookings(req: Request, res: Response) {
    const timeslot = await this.getTimeslot(req, res);
    const bookings = await BookingsController.validateBookings(
      timeslot?.bookings || []
    );

    res.json(bookings);
  }

  public async createBooking(req: Request, res: Response) {
    const timeslot = await this.getTimeslot(req, res);
    const bookingData = BookingsController.retrieveBookingData(req, res);

    if (bookingData != null) {
      try {
        const booking = await Booking.create<Booking>({
          timeslotId: timeslot.id,
          ...bookingData,
        });

        res.status(201).json(booking);
      } catch (error) {
        res.status(500).json(error);
      }
    }
  }

  // noinspection JSMethodCanBeStatic
  private async getTimeslot(req: Request, _: Response): Promise<Timeslot> {
    const timeslot = await Timeslot.findByPk<Timeslot>(req.params.id, {
      include: [Booking, Weekday],
    });

    if (timeslot != null) {
      return timeslot;
    } else {
      throw new ControllerError('Timeslot not found', 404);
    }
  }

  public async update(req: Request, res: Response) {
    const timeslotData = TimeslotsController.retrieveTimeslotData(req, res);

    if (timeslotData != null) {
      const update: UpdateOptions = {
        where: { id: req.params.id },
        limit: 1,
      };

      try {
        await Timeslot.update(timeslotData, update);

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
      await Timeslot.destroy(options);

      res.status(204).json({ data: 'success' });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public static retrieveTimeslotData(
    req: Request,
    res: Response
  ): TimeslotInterface | null {
    const timeslotData = req.body;
    if (isTimeslotInterface(timeslotData)) {
      return timeslotData;
    } else {
      res.status(500).json({ errors: ['Invalid timeslot format.'] });
      return null;
    }
  }
}
