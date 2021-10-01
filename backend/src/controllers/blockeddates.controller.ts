import { Response } from 'express';
import { MissingPathParameter } from './errors';
import { boundClass } from 'autobind-decorator';
import { checkType, hasProperty } from 'common/dist';
import TypesafeRequest from './TypesafeRequest';
import { delay, inject, singleton } from 'tsyringe';
import BlockedDateRepository from '../repositories/BlockedDateRepository';
import { DateTime } from 'luxon';
import { ISO8601, noRefinementChecks } from 'common';

@singleton()
@boundClass
export class BlockedDatesController {
  constructor(
    @inject(delay(() => BlockedDateRepository))
    private readonly blockedDateRepository: BlockedDateRepository
  ) {}

  public async index(req: TypesafeRequest, res: Response<readonly ISO8601[]>) {
    const startDateString = req.query.start;
    const endDateString = req.query.end;

    let blockedDates: DateTime[];

    if (
      startDateString != null &&
      typeof startDateString === 'string' &&
      endDateString != null &&
      typeof endDateString === 'string'
    ) {
      const startDate = DateTime.fromISO(startDateString);
      const endDate = DateTime.fromISO(endDateString);

      blockedDates = await this.blockedDateRepository.getInRange(
        startDate,
        endDate
      );
    } else {
      blockedDates = await this.blockedDateRepository.findAll();
    }

    res.json(
      blockedDates.map((date) => noRefinementChecks<ISO8601>(date.toISODate()))
    );
  }

  public async create(req: TypesafeRequest, res: Response) {
    const dateString = BlockedDatesController.dateFromRoute(req);
    const date = DateTime.fromISO(dateString);

    await this.blockedDateRepository.create(date);

    res.status(201).json();
  }

  public async delete(req: TypesafeRequest, res: Response) {
    const dateString = BlockedDatesController.dateFromRoute(req);
    const date = DateTime.fromISO(dateString);

    await this.blockedDateRepository.destroy(date);

    res.status(204).json();
  }

  private static dateFromRoute(req: TypesafeRequest): ISO8601 {
    if (hasProperty(req.params, 'date')) {
      return checkType(req.params.date, ISO8601);
    } else {
      throw new MissingPathParameter('date');
    }
  }
}
