import { Request, Response } from 'express';
import { ControllerError, UnprocessableEntity } from './errors';
import { boundClass } from 'autobind-decorator';
import {
  checkType,
  NonEmptyString,
  TimeslotGetInterface,
  TimeslotPostInterface,
  WeekdayGetInterface,
  WeekdayPostInterface,
} from 'common/dist';
import TimeslotRepository from '../repositories/TimeslotRepository';
import WeekdayRepository from '../repositories/WeekdayRepository';
import WeekdayDBInterface from '../repositories/model_interfaces/WeekdayDBInterface';

// FIXME: Implement in terms of weekday repository
@boundClass
export class WeekdaysController {
  private readonly weekdayRepository: WeekdayRepository;
  private readonly timeslotRepository: TimeslotRepository;

  constructor(
    weekdayRepository: WeekdayRepository,
    timeslotRepository: TimeslotRepository
  ) {
    this.weekdayRepository = weekdayRepository;
    this.timeslotRepository = timeslotRepository;
  }

  private async toGetInterface(
    weekdays: WeekdayDBInterface[]
  ): Promise<WeekdayGetInterface[]> {
    return Promise.all(weekdays.map((weekday) => weekday.toGetInterface()));
  }

  public async index(req: Request, res: Response<WeekdayGetInterface[]>) {
    const weekdays = await this.weekdayRepository.findAll();

    res.json(await this.toGetInterface(weekdays));
  }

  public async show(req: Request, res: Response<WeekdayGetInterface>) {
    const weekday = await this.getWeekday(req);

    res.json(await weekday.toGetInterface());
  }

  public async createTimeslot(
    req: Request,
    res: Response<TimeslotGetInterface>
  ) {
    const weekday = await this.getWeekday(req);

    const timeslotData = checkType(req.body, TimeslotPostInterface);

    const timeslot = await this.timeslotRepository.create(
      weekday.id,
      timeslotData
    );

    res.status(201).json(await timeslot.toGetInterface());
  }

  public async getTimeslots(
    req: Request,
    res: Response<TimeslotGetInterface[]>
  ) {
    const weekday = await this.getWeekday(req);
    const timeslots = await weekday?.getTimeslots();

    res.json(
      await Promise.all(timeslots.map((timeslot) => timeslot.toGetInterface()))
    );
  }

  private async getWeekday(req: Request): Promise<WeekdayDBInterface> {
    const weekday = await this.weekdayRepository.findById(
      this.weekdayIdFromRequest(req)
    );

    if (weekday != null) {
      return weekday;
    } else {
      throw new ControllerError('Weekday not found', 404);
    }
  }

  public async update(req: Request, res: Response) {
    const weekdayData = checkType(req.body, WeekdayPostInterface);

    await this.weekdayRepository.update(
      this.weekdayIdFromRequest(req),
      weekdayData
    );

    res.status(202).json({ data: 'success' });
  }

  public async delete(req: Request, res: Response) {
    await this.weekdayRepository.delete(this.weekdayIdFromRequest(req));

    res.status(204).json({ data: 'success' });
  }

  private weekdayIdFromRequest(req: Request): number {
    const maybeId = parseInt(req.params.id);

    if (isNaN(maybeId)) {
      throw new UnprocessableEntity('Missing numeric weekday id');
    } else {
      return maybeId;
    }
  }
}
