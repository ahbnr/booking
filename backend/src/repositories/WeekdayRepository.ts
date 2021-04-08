import {
  ResourceGetInterface,
  WeekdayGetInterface,
  WeekdayPostInterface,
} from 'common/dist';
import { UniqueConstraintError } from 'sequelize';
import { DataIdAlreadyExists } from './errors';
import { Weekday } from '../models/weekday.model';
import { Resource } from '../models/resource.model';

export default class WeekdayRepository {
  public async create(
    resource: Resource,
    weekdayData: WeekdayPostInterface
  ): Promise<Weekday> {
    try {
      const weekday = await Weekday.create<Weekday>({
        resourceName: resource.name,
        ...weekdayData,
      });

      return weekday;
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new DataIdAlreadyExists();
      }

      throw e;
    }
  }
}
