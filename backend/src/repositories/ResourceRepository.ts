import {
  noRefinementChecks,
  ResourceGetInterface,
  ResourcePostInterface,
} from 'common/dist';
import { Resource } from '../models/resource.model';
import {
  DestroyOptions,
  UniqueConstraintError,
  UpdateOptions,
} from 'sequelize';
import {
  DataIdAlreadyExists,
  NoElementToDestroy,
  NoElementToUpdate,
} from './errors';
import ResourceDBInterface from './model_interfaces/ResourceDBInterface';
import { boundClass } from 'autobind-decorator';
import WeekdayDBInterface from './model_interfaces/WeekdayDBInterface';
import WeekdayRepository from './WeekdayRepository';

@boundClass
export default class ResourceRepository {
  private weekdayRepository!: WeekdayRepository;

  public init(weekdayRepository: WeekdayRepository) {
    this.weekdayRepository = weekdayRepository;
  }

  private toInterface(resource: Resource): ResourceDBInterface {
    return new ResourceDBInterface(resource, this);
  }

  public async findAll(): Promise<ResourceDBInterface[]> {
    const resources = await Resource.findAll({ include: [{ all: true }] });

    return resources.map(this.toInterface);
  }

  public async findByName(
    resourceName: string
  ): Promise<ResourceDBInterface | null> {
    const resource = await Resource.findByPk<Resource>(resourceName, {
      include: [{ all: true }],
    });

    if (resource != null) {
      return this.toInterface(resource);
    } else {
      return null;
    }
  }

  public async create(
    resourceName: string,
    resourceData: ResourcePostInterface
  ): Promise<ResourceDBInterface> {
    try {
      const resource = await Resource.create({
        ...resourceData,
        name: resourceName,
      });

      return this.toInterface(resource);
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new DataIdAlreadyExists();
      }

      throw e;
    }
  }

  public async update(
    resourceName: string,
    resourceData: ResourcePostInterface
  ) {
    const update: UpdateOptions = {
      where: { name: resourceName },
      limit: 1,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [numAffectedRows, _] = await Resource.update(resourceData, update);

    if (numAffectedRows < 1) {
      throw new NoElementToUpdate('resource');
    }
  }

  public async destroy(resourceName: string) {
    const options: DestroyOptions = {
      where: { name: resourceName },
      limit: 1,
    };

    const destroyedRows = await Resource.destroy(options);

    if (destroyedRows < 1) {
      throw new NoElementToDestroy('resource');
    }
  }

  public async getAssociatedWeekdays(
    resource: Resource
  ): Promise<WeekdayDBInterface[]> {
    const weekdays = await resource.lazyWeekdays;

    return weekdays.map(this.weekdayRepository.toInterface);
  }
}