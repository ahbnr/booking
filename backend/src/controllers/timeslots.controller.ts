import { Response } from 'express';
import { Timeslot } from '../models/timeslot.model';
import { ElementNotFound, MissingPathParameter } from './errors';
import { boundClass } from 'autobind-decorator';
import {
  checkType,
  hasProperty,
  TimeslotGetInterface,
  TimeslotPostInterface,
} from 'common/dist';
import TimeslotRepository from '../repositories/TimeslotRepository';
import TypesafeRequest from './TypesafeRequest';

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
      await Promise.all(timeslots.map((timeslot) => timeslot.asGetInterface()))
    );
  }

  public async show(req: TypesafeRequest, res: Response<TimeslotGetInterface>) {
    const timeslot = await this.getTimeslot(req);

    res.json(await timeslot.asGetInterface());
  }

  // FIXME: Update booking dates when timeslot is updated?
  public async update(req: TypesafeRequest, res: Response) {
    const timeslotId = this.getTimeslotId(req);
    const timeslotData = checkType(req.body, TimeslotPostInterface);

    await this.timeslotRepository.update(timeslotId, timeslotData);

    res.status(202).json('success');
  }

  public async delete(req: TypesafeRequest, res: Response) {
    const timeslotId = this.getTimeslotId(req);
    await this.timeslotRepository.destroy(timeslotId);

    res.status(204).json('success');
  }

  private getTimeslotId(req: TypesafeRequest): number {
    if (hasProperty(req.params, 'id') && typeof req.params.id === 'string') {
      return parseInt(req.params.id);
    } else {
      throw new MissingPathParameter('id');
    }
  }

  // noinspection JSMethodCanBeStatic
  private async getTimeslot(req: TypesafeRequest): Promise<Timeslot> {
    const timeslotId = this.getTimeslotId(req);
    const timeslot = await this.timeslotRepository.findById(timeslotId);

    if (timeslot != null) {
      return timeslot;
    } else {
      throw new ElementNotFound('timeslot');
    }
  }
}
