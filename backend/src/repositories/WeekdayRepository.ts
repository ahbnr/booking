import { WeekdayPostInterface } from 'common/dist';
import { DestroyOptions, Op } from 'sequelize';
import { DataIdAlreadyExists, NoElementToUpdate } from './errors';
import { Weekday } from '../models/weekday.model';
import WeekdayDBInterface from './model_interfaces/WeekdayDBInterface';
import ResourceDBInterface from './model_interfaces/ResourceDBInterface';
import { boundClass } from 'autobind-decorator';
import { Timeslot } from '../models/timeslot.model';
import TimeslotDBInterface from './model_interfaces/TimeslotDBInterface';
import TimeslotRepository from './TimeslotRepository';
import { delay, inject, singleton } from 'tsyringe';

@singleton()
@boundClass
export default class WeekdayRepository {
  constructor(
    @inject(delay(() => TimeslotRepository))
    private readonly timeslotRepository: TimeslotRepository
  ) {}

  public toInterface(weekday: Weekday): WeekdayDBInterface {
    return new WeekdayDBInterface(weekday, this);
  }

  public weekdaysToDBInterface(weekdays: Weekday[]): WeekdayDBInterface[] {
    return weekdays.map(this.toInterface);
  }

  public async findAll(): Promise<WeekdayDBInterface[]> {
    const weekdays = await Weekday.findAll({});

    return this.weekdaysToDBInterface(weekdays);
  }

  public async findById(
    weekdayId: number
  ): Promise<WeekdayDBInterface | undefined> {
    const weekday = await Weekday.findByPk<Weekday>(weekdayId, {
      include: [Timeslot],
    });

    if (weekday != null) {
      return this.toInterface(weekday);
    } else {
      return undefined;
    }
  }

  public async create(
    resource: ResourceDBInterface,
    weekdayData: WeekdayPostInterface
  ): Promise<WeekdayDBInterface> {
    // does this weekday already exist for this resource?
    const doesWeekdayExist = await Weekday.findOne({
      where: {
        [Op.and]: [
          {
            name: weekdayData.name,
          },
          {
            resourceName: resource.data.name,
          },
        ],
      },
    });

    if (doesWeekdayExist != null) {
      throw new DataIdAlreadyExists();
    }

    const weekday = await Weekday.create<Weekday>({
      resourceName: resource.data.name,
      ...weekdayData,
    });

    return this.toInterface(weekday);
  }

  public async update(
    weekdayId: number,
    data: WeekdayPostInterface
  ): Promise<WeekdayDBInterface> {
    const maybeWeekday = await Weekday.findByPk(weekdayId);

    if (maybeWeekday != null) {
      const updatedWeekday = await maybeWeekday.update(data);

      return this.toInterface(updatedWeekday);
    } else {
      throw new NoElementToUpdate('weekday');
    }
  }

  public async delete(weekdayId: number) {
    const options: DestroyOptions = {
      where: { id: weekdayId },
      limit: 1,
    };

    await Weekday.destroy(options);
  }

  public async getTimeslotsOfWeekday(
    weekday: Weekday
  ): Promise<TimeslotDBInterface[]> {
    const timeslots = await weekday.lazyTimeslots;

    return Promise.all(timeslots.map(this.timeslotRepository.toInterface));
  }
}
