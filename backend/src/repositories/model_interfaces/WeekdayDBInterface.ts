import {
  noRefinementChecks,
  WeekdayData,
  WeekdayGetInterface,
} from 'common/dist';
import { Weekday } from '../../models/weekday.model';
import { LazyGetter } from 'lazy-get-decorator';
import TimeslotDBInterface from './TimeslotDBInterface';
import WeekdayRepository from '../WeekdayRepository';

export default class WeekdayDBInterface {
  private readonly weekday: Weekday;
  private readonly repository: WeekdayRepository;

  constructor(weekday: Weekday, repository: WeekdayRepository) {
    this.weekday = weekday;
    this.repository = repository;
  }

  public get id(): number {
    return this.weekday.id;
  }
  public get resourceName(): string {
    return this.weekday.resourceName;
  }

  @LazyGetter()
  public get data(): WeekdayData {
    return noRefinementChecks<WeekdayData>({
      name: this.weekday.name,
    });
  }

  public getTimeslots(): Promise<TimeslotDBInterface[]> {
    return this.repository.getTimeslotsOfWeekday(this.weekday);
  }

  public async toGetInterface(): Promise<WeekdayGetInterface> {
    return {
      ...this.data,
      id: this.weekday.id,
      resourceName: this.weekday.resourceName,
    };
  }
}
