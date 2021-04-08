import { Request, Response } from 'express';
import { ElementNotFound } from './errors';
import { boundClass } from 'autobind-decorator';
import {
  BookingGetInterface,
  checkType,
  TimeslotGetInterface,
  TimeslotPostInterface,
} from 'common/dist';
import TimeslotRepository from '../repositories/TimeslotRepository';
import TypesafeRequest from './TypesafeRequest';
import TimeslotDBInterface from '../repositories/model_interfaces/TimeslotDBInterface';
import { extractNumericIdFromRequest } from './utils';

@boundClass
export class TimeslotsController {
  private readonly timeslotRepository: TimeslotRepository;

  constructor(timeslotRepository: TimeslotRepository) {
    this.timeslotRepository = timeslotRepository;
  }

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
    req: Request,
    res: Response<BookingGetInterface[]>
  ) {
    const timeslot = await this.getTimeslot(req);
    const bookings = await timeslot.getBookings();

    res.json(
      await Promise.all(bookings.map((booking) => booking.toGetInterface()))
    );
  }
}
