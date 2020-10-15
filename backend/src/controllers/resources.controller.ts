import { Request, Response } from 'express';
import { Weekday } from '../models/weekday.model';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import { ControllerError } from './errors';
import { boundClass } from 'autobind-decorator';
import { Resource } from '../models/resource.model';
import {
  checkType,
  NonEmptyString,
  noRefinementChecks,
  ResourceGetInterface,
  ResourcePostInterface,
  WeekdayGetInterface,
  WeekdayPostInterface,
} from 'common/dist';

@boundClass
export class ResourcesController {
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

  public async index(req: Request, res: Response<ResourceGetInterface[]>) {
    const resources = await Resource.findAll({ include: [{ all: true }] });

    res.json(resources.map(ResourcesController.resourceAsGetInterface));
  }

  public async create(req: Request, res: Response<ResourceGetInterface>) {
    const resourceName = ResourcesController.retrieveResourceName(req);
    const resourceData = checkType(req.body, ResourcePostInterface);

    if (resourceData != null) {
      try {
        const resource = await Resource.create({
          ...resourceData,
          name: resourceName,
        });

        res
          .status(201)
          .json(ResourcesController.resourceAsGetInterface(resource));
      } catch (error) {
        res.status(500).json(error);
      }
    }
  }

  public async show(req: Request, res: Response<ResourceGetInterface>) {
    const resource = await this.getResource(req);

    res.json(ResourcesController.resourceAsGetInterface(resource));
  }

  public async createWeekday(req: Request, res: Response<WeekdayGetInterface>) {
    const resource = await this.getResource(req);

    const weekdayData = checkType(req.body, WeekdayPostInterface);
    if (weekdayData != null) {
      try {
        const weekday = await Weekday.create<Weekday>({
          resourceName: resource.name,
          ...weekdayData,
        });

        res.status(201).json(weekday);
      } catch (error) {
        res.status(500).json(error);
      }
    }
  }

  public async getWeekdays(req: Request, res: Response<WeekdayGetInterface[]>) {
    const resource = await this.getResource(req);
    const weekdays = resource?.weekdays;

    if (weekdays != null) {
      res.json(weekdays);
    } else {
      res.json([]);
    }
  }

  // noinspection JSMethodCanBeStatic
  private async getResource(req: Request): Promise<Resource> {
    const resourceName = ResourcesController.retrieveResourceName(req);
    const resource = await Resource.findByPk<Resource>(resourceName, {
      include: [{ all: true }],
    });

    if (resource != null) {
      return resource;
    } else {
      throw new ControllerError('Resource not found', 404);
    }
  }

  public async update(req: Request, res: Response) {
    const resourceName = ResourcesController.retrieveResourceName(req);

    if (resourceName != null) {
      const resourceData = checkType(req.body, ResourcePostInterface);
      if (resourceData != null) {
        const update: UpdateOptions = {
          where: { name: resourceName },
          limit: 1,
        };

        try {
          await Resource.update(resourceData, update);

          res.status(202).json({ data: 'success' });
        } catch (error) {
          res.status(500).json(error);
        }
      }
    }
  }

  public async delete(req: Request, res: Response) {
    const resourceName = ResourcesController.retrieveResourceName(req);

    const options: DestroyOptions = {
      where: { name: resourceName },
      limit: 1,
    };

    await Resource.destroy(options);

    res.status(204).json({ data: 'success' });
  }

  private static retrieveResourceName(req: Request): NonEmptyString {
    return checkType(req.params.name, NonEmptyString);
  }
}
