import { DestroyOptions, Op, UniqueConstraintError } from 'sequelize';
import { DataIdAlreadyExists, NoElementToDestroy } from './errors';
import { boundClass } from 'autobind-decorator';
import { singleton } from 'tsyringe';
import { DateTime } from 'luxon';
import { BlockedDate } from '../models/blockeddate.model';

@singleton()
@boundClass
export default class BlockedDateRepository {
  public async getInRange(
    startDate: DateTime,
    endDate: DateTime
  ): Promise<DateTime[]> {
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

    return blockedDates.map((blockedDate) =>
      DateTime.fromJSDate(blockedDate.date)
    );
  }

  public async findAll(): Promise<DateTime[]> {
    const blockedDates = await BlockedDate.findAll({
      include: [{ all: true }],
    });

    return blockedDates.map((blockedDate) =>
      DateTime.fromJSDate(blockedDate.date)
    );
  }

  public async create(date: DateTime) {
    try {
      await BlockedDate.create({
        date: date.toJSDate(),
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
