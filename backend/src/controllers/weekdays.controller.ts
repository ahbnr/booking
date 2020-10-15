import { Request, Response } from 'express';
import { Weekday } from '../models/weekday.model';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import { ControllerError } from './errors';
import { boundClass } from 'autobind-decorator';
import { Timeslot } from '../models/timeslot.model';
import { TimeslotsController } from './timeslots.controller';
import {
  checkType,
  TimeslotGetInterface,
  TimeslotPostInterface,
  WeekdayGetInterface,
  WeekdayPostInterface,
} from 'common/dist';

@boundClass
export class WeekdaysController {
  public async index(req: Request, res: Response<WeekdayGetInterface[]>) {
    const weekdays = await Weekday.findAll({});

    res.json(weekdays.map((booking) => booking.toTypedJSON()));
  }

  public async show(req: Request, res: Response<WeekdayGetInterface>) {
    const weekday = await this.getWeekday(req);

    res.json(weekday.toTypedJSON());
  }

  public async createTimeslot(
    req: Request,
    res: Response<TimeslotGetInterface>
  ) {
    const weekday = await this.getWeekday(req);

    const timeslotData = checkType(req.body, TimeslotPostInterface);
    try {
      const timeslot = await Timeslot.create<Timeslot>({
        weekdayId: weekday.id,
        ...timeslotData,
      });

      res.status(201).json(await timeslot.asGetInterface());
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async getTimeslots(
    req: Request,
    res: Response<TimeslotGetInterface[]>
  ) {
    const weekday = await this.getWeekday(req);
    const timeslots = weekday?.timeslots;

    if (timeslots != null) {
      res.json(
        await Promise.all(
          timeslots.map((timeslot) => timeslot.asGetInterface())
        )
      );
    } else {
      res.json([]);
    }
  }

  // noinspection JSMethodCanBeStatic
  private async getWeekday(req: Request): Promise<Weekday> {
    const weekday = await Weekday.findByPk<Weekday>(req.params.id, {
      include: [Timeslot],
    });

    if (weekday != null) {
      return weekday;
    } else {
      throw new ControllerError('Weekday not found', 404);
    }
  }

  public async update(req: Request, res: Response) {
    const weekdayData = checkType(req.body, WeekdayPostInterface);

    const update: UpdateOptions = {
      where: { id: req.params.id },
      limit: 1,
    };

    try {
      await Weekday.update(weekdayData, update);

      res.status(202).json({ data: 'success' });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async delete(req: Request, res: Response) {
    const weekdayName: string | null | undefined = req.params.name;

    if (weekdayName != null) {
      const options: DestroyOptions = {
        where: { name: weekdayName },
        limit: 1,
      };

      try {
        await Weekday.destroy(options);

        res.status(204).json({ data: 'success' });
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(500).json({ data: 'Weekday not specified.' });
    }
  }
}
