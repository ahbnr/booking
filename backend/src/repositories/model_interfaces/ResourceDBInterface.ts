import {
  noRefinementChecks,
  ResourceData,
  ResourceGetInterface,
} from 'common/dist';
import { Resource } from '../../models/resource.model';
import ResourceRepository from '../ResourceRepository';
import { LazyGetter } from 'lazy-get-decorator';
import WeekdayDBInterface from './WeekdayDBInterface';

export default class ResourceDBInterface {
  private readonly resource: Resource;
  private readonly repository: ResourceRepository;

  constructor(resource: Resource, repository: ResourceRepository) {
    this.resource = resource;
    this.repository = repository;
  }

  @LazyGetter()
  public get data(): ResourceData {
    return noRefinementChecks<ResourceData>({
      name: this.resource.name,
    });
  }

  public async getWeekdays(): Promise<WeekdayDBInterface[]> {
    return this.repository.getAssociatedWeekdays(this.resource);
  }

  public async toGetInterface(): Promise<ResourceGetInterface> {
    return noRefinementChecks<ResourceGetInterface>({
      name: this.resource.name,
      weekdayIds: (await this.getWeekdays()).map((weekday) => weekday.id),
    });
  }
}
