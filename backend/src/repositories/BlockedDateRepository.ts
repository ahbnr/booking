import { DestroyOptions, Op, UniqueConstraintError } from 'sequelize';
import { DataIdAlreadyExists, NoElementToDestroy } from './errors';
import { boundClass } from 'autobind-decorator';
import { singleton } from 'tsyringe';
import { DateTime } from 'luxon';
import { BlockedDate } from '../models/blockeddate.model';
import BlockedDateDBInterface from './model_interfaces/BlockedDateDBInterface';
import { NonEmptyString } from 'common';

@singleton()
@boundClass
export default class BlockedDateRepository {
  public async getInRange(
    startDate: DateTime,
    endDate: DateTime
  ): Promise<BlockedDateDBInterface[]> {
    const startDateString = startDate.startOf('day').toISO();
    const endDateString = endDate.endOf('day').toISO();

    const blockedDates = await BlockedDate.findAll({
      where: {
        date: {
          [Op.between]: [startDateString, endDateString],
        },
      },
      include: [{ all: true }],
    });

    return blockedDates.map(
      (blockedDate) => new BlockedDateDBInterface(blockedDate, this)
    );
  }

  public async findAll(): Promise<BlockedDateDBInterface[]> {
    const blockedDates = await BlockedDate.findAll({
      include: [{ all: true }],
    });

    return blockedDates.map(
      (blockedDate) => new BlockedDateDBInterface(blockedDate, this)
    );
  }

  public async create(date: DateTime, note: NonEmptyString | undefined) {
    try {
      await BlockedDate.create({
        date: date.toJSDate(),
        note,
      });
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new DataIdAlreadyExists();
      }

      throw e;
    }
  }

  public async destroy(date: DateTime) {
    const options: DestroyOptions = {
      where: { date: date.toJSDate() },
      limit: 1,
    };

    const destroyedRows = await BlockedDate.destroy(options);

    if (destroyedRows < 1) {
      throw new NoElementToDestroy('blockeddate');
    }
  }
}
