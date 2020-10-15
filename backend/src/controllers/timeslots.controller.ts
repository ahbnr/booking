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
  public async index(req: Request, res: Response<TimeslotGetInterface[]>) {
    const timeslots = await Timeslot.findAll<Timeslot>({});

    res.json(
      await Promise.all(timeslots.map((timeslot) => timeslot.asGetInterface()))
    );
  }

  public async show(req: Request, res: Response<TimeslotGetInterface>) {
    const timeslot = await TimeslotsController.getTimeslot(req);

    res.json(await timeslot.asGetInterface());
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

  // FIXME: Update booking dates when timeslot is updated?
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

    await Timeslot.destroy(options);

    res.status(204).json({ data: 'success' });
  }
}
