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
import TypesafeRequest from './TypesafeRequest';
import { extractNumericIdFromRequest } from './utils';
import SettingsRepository from '../repositories/SettingsRepository';
import computeBookingConditions from '../date_math/computeBookingConditions';

// FIXME: Implement in terms of weekday repository
@boundClass
export class WeekdaysController {
  private readonly weekdayRepository: WeekdayRepository;
  private readonly timeslotRepository: TimeslotRepository;
  private readonly settingsRepository: SettingsRepository;

  constructor(
    weekdayRepository: WeekdayRepository,
    timeslotRepository: TimeslotRepository,
    settingsRepository: SettingsRepository
  ) {
    this.weekdayRepository = weekdayRepository;
    this.timeslotRepository = timeslotRepository;
    this.settingsRepository = settingsRepository;
  }

  private async toGetInterface(
    weekdays: WeekdayDBInterface[]
  ): Promise<WeekdayGetInterface[]> {
    return Promise.all(weekdays.map((weekday) => weekday.toGetInterface()));
  }

  public async index(
    req: TypesafeRequest,
    res: Response<WeekdayGetInterface[]>
  ) {
    const weekdays = await this.weekdayRepository.findAll();

    res.json(await this.toGetInterface(weekdays));
  }

  public async show(req: TypesafeRequest, res: Response<WeekdayGetInterface>) {
    const weekday = await this.getWeekday(req);

    res.json(await weekday.toGetInterface());
  }

  public async createTimeslot(
    req: TypesafeRequest,
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
    req: TypesafeRequest,
    res: Response<TimeslotGetInterface[]>
  ) {
    const weekday = await this.getWeekday(req);
    const timeslots = await weekday?.getTimeslots();

    res.json(
      await Promise.all(timeslots.map((timeslot) => timeslot.toGetInterface()))
    );
  }

  private async getWeekday(req: TypesafeRequest): Promise<WeekdayDBInterface> {
    const weekday = await this.weekdayRepository.findById(
      extractNumericIdFromRequest(req)
    );

    if (weekday != null) {
      return weekday;
    } else {
      throw new ControllerError('Weekday not found', 404);
    }
  }

  public async update(req: TypesafeRequest, res: Response) {
    const weekdayData = checkType(req.body, WeekdayPostInterface);

    await this.weekdayRepository.update(
      extractNumericIdFromRequest(req),
      weekdayData
    );

    res.status(202).json({ data: 'success' });
  }

  public async delete(req: TypesafeRequest, res: Response) {
    await this.weekdayRepository.delete(extractNumericIdFromRequest(req));

    res.status(204).json({ data: 'success' });
  }

  public async getBookingConditions(req: TypesafeRequest, res: Response) {
    const weekday = await this.getWeekday(req);

    const bookingConditions = await computeBookingConditions(
      weekday.data.name,
      this.settingsRepository
    );

    res.json(bookingConditions);
  }
}
