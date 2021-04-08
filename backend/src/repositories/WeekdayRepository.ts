import { WeekdayData, WeekdayName, WeekdayPostInterface } from 'common/dist';
import {
  DestroyOptions,
  UniqueConstraintError,
  UpdateOptions,
} from 'sequelize';
import { DataIdAlreadyExists } from './errors';
import { Weekday } from '../models/weekday.model';
import { Resource } from '../models/resource.model';
import WeekdayDBInterface from './model_interfaces/WeekdayDBInterface';
import ResourceDBInterface from './model_interfaces/ResourceDBInterface';
import { boundClass } from 'autobind-decorator';
import { Timeslot } from '../models/timeslot.model';
import TimeslotDBInterface from './model_interfaces/TimeslotDBInterface';
import TimeslotRepository from './TimeslotRepository';

@boundClass
export default class WeekdayRepository {
  private timeslotRepository!: TimeslotRepository;

  public init(timeslotRepository: TimeslotRepository) {
    this.timeslotRepository = timeslotRepository;
  }

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
    try {
      const weekday = await Weekday.create<Weekday>({
        resourceName: resource.data.name,
        ...weekdayData,
      });

      return this.toInterface(weekday);
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new DataIdAlreadyExists();
      }

      throw e;
    }
  }

  public async update(
    weekdayId: number,
    data: WeekdayPostInterface
  ): Promise<WeekdayDBInterface> {
    const update: UpdateOptions = {
      where: { id: weekdayId },
      limit: 1,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, [updatedWeekday]] = await Weekday.update(data, update);

    return this.toInterface(updatedWeekday);
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
