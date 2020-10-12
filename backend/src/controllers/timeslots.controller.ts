import { Request, Response } from 'express';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import { Timeslot } from '../models/timeslot.model';
import { ControllerError } from './errors';
import { boundClass } from 'autobind-decorator';
import { Booking } from '../models/booking.model';
import { BookingsController } from './bookings.controller';
import { Weekday } from '../models/weekday.model';
import {
  BookingGetInterface,
  checkType,
  noRefinementChecks,
  TimeslotGetInterface,
  TimeslotPostInterface,
} from 'common/dist';

@boundClass
export class TimeslotsController {
  public static async timeslotAsGetInterface(
    timeslot: Timeslot
  ): Promise<TimeslotGetInterface> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bookings, weekday, ...strippedTimeslot } = timeslot.toTypedJSON();

    const lazyBookings = await timeslot.lazyBookings;
    const lazyWeekday = await timeslot.lazyWeekday;

    // no refinement checks, we assume the database records are correct at least regarding refinements
    return noRefinementChecks<TimeslotGetInterface>({
      ...strippedTimeslot,
      bookingIds: lazyBookings.map((booking) => booking.id),
      weekdayId: lazyWeekday.id,
    });
  }

  public async index(req: Request, res: Response<TimeslotGetInterface[]>) {
    const timeslots = await Timeslot.findAll<Timeslot>({});

    res.json(
      await Promise.all(
        timeslots.map(TimeslotsController.timeslotAsGetInterface)
      )
    );
  }

  public async show(req: Request, res: Response<TimeslotGetInterface>) {
    const timeslot = await TimeslotsController.getTimeslot(req);

    res.json(await TimeslotsController.timeslotAsGetInterface(timeslot));
  }

  public async getBookings(req: Request, res: Response<BookingGetInterface[]>) {
    const timeslot = await TimeslotsController.getTimeslot(req);
    const bookings = await BookingsController.clearPastBookings(
      timeslot?.bookings || []
    );

    res.json(noRefinementChecks<BookingGetInterface[]>(bookings));
  }

  // noinspection JSMethodCanBeStatic
  public static async getTimeslot(req: Request): Promise<Timeslot> {
    const timeslot = await Timeslot.findByPk<Timeslot>(req.params.id);

    if (timeslot != null) {
      return timeslot;
    } else {
      throw new ControllerError('Timeslot not found', 404);
    }
  }

  public async update(req: Request, res: Response) {
    const timeslotData = checkType(req.body, TimeslotPostInterface);

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
}
