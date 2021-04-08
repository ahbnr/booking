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

export default class ResourceRepository {
  public async findAll(): Promise<Resource[]> {
    const resources = await Resource.findAll({ include: [{ all: true }] });

    return resources;
  }

  public async findByName(resourceName: string): Promise<Resource | null> {
    const resource = await Resource.findByPk<Resource>(resourceName, {
      include: [{ all: true }],
    });

    if (resource != null) {
      return resource;
    } else {
      return null;
    }
  }

  public async create(
    resourceName: string,
    resourceData: ResourcePostInterface
  ): Promise<Resource> {
    try {
      const resource = await Resource.create({
        ...resourceData,
        name: resourceName,
      });

      return resource;
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

  public static resourceAsGetInterface(
    resource: Resource
  ): ResourceGetInterface {
    const { weekdays, ...strippedResource } = resource.toTypedJSON();

    // no refinement checks, we assume the database records are correct at least regarding refinements
    return noRefinementChecks<ResourceGetInterface>({
      ...strippedResource,
      weekdayIds: weekdays?.map((weekday) => weekday.id) || [],
    });
  }
}
