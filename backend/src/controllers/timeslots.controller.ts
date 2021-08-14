import { Response } from 'express';
import { ElementNotFound, MissingPathParameter } from './errors';
import { boundClass } from 'autobind-decorator';
import {
  BookingGetInterface,
  checkType,
  hasProperty,
  TimeslotGetInterface,
  TimeslotPostInterface,
} from 'common/dist';
import TimeslotRepository from '../repositories/TimeslotRepository';
import TypesafeRequest from './TypesafeRequest';
import TimeslotDBInterface from '../repositories/model_interfaces/TimeslotDBInterface';
import { extractNumericIdFromRequest } from './utils';
import { DateTime } from 'luxon';
import { ISO8601 } from 'common/dist/typechecking/ISO8601';
import { delay, inject, singleton } from 'tsyringe';

@singleton()
@boundClass
export class TimeslotsController {
  constructor(
    @inject(delay(() => TimeslotRepository))
    private readonly timeslotRepository: TimeslotRepository
  ) {}

  public async index(
    req: TypesafeRequest,
    res: Response<TimeslotGetInterface[]>
  ) {
    const timeslots = await this.timeslotRepository.findAll();

    res.json(
      await Promise.all(timeslots.map((timeslot) => timeslot.toGetInterface()))
    );
  }

  public async show(req: TypesafeRequest, res: Response<TimeslotGetInterface>) {
    const timeslot = await this.getTimeslot(req);

    res.json(await timeslot.toGetInterface());
  }

  // FIXME: Update booking dates when timeslot is updated?
  public async update(req: TypesafeRequest, res: Response) {
    const timeslotId = extractNumericIdFromRequest(req);
    const timeslotData = checkType(req.body, TimeslotPostInterface);

    await this.timeslotRepository.update(timeslotId, timeslotData);

    res.status(202).json('success');
  }

  public async delete(req: TypesafeRequest, res: Response) {
    const timeslotId = extractNumericIdFromRequest(req);
    await this.timeslotRepository.destroy(timeslotId);

    res.status(204).json('success');
  }

  public async getTimeslot(req: TypesafeRequest): Promise<TimeslotDBInterface> {
    const timeslotId = extractNumericIdFromRequest(req);
    const timeslot = await this.timeslotRepository.findById(timeslotId);

    if (timeslot != null) {
      return timeslot;
    } else {
      throw new ElementNotFound('timeslot');
    }
  }

  public async getBookingsForTimeslot(
    req: TypesafeRequest,
    res: Response<BookingGetInterface[]>
  ) {
    const timeslot = await this.getTimeslot(req);
    const day = TimeslotsController.retrieveDayDate(req);
    const bookings = await timeslot.getBookings(day);

    res.json(
      await Promise.all(bookings.map((booking) => booking.toGetInterface()))
    );
  }

  public async countBookingsForTimeslot(
    req: TypesafeRequest,
    res: Response<number>
  ) {
    const timeslot = await this.getTimeslot(req);
    const day = TimeslotsController.retrieveDayDate(req);
    const bookings = await timeslot.getBookings(day);

    res.json(bookings.length);
  }

  private static retrieveDayDate(req: TypesafeRequest): DateTime {
    if (hasProperty(req.params, 'dayDate')) {
      const dateString = checkType(req.params.dayDate, ISO8601);
      const date = DateTime.fromISO(dateString);

      return date.startOf('day');
    } else {
      throw new MissingPathParameter('dayDate');
    }
  }
}
