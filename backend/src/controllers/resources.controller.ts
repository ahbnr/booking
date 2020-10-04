import { Request, Response } from 'express';
import { Weekday } from '../models/weekday.model';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import { ControllerError } from './errors';
import { boundClass } from 'autobind-decorator';
import {
  isResourceInterface,
  Resource,
  ResourceInterface,
} from '../models/resource.model';
import { WeekdaysController } from './weekdays.controller';

@boundClass
export class ResourcesController {
  public async index(req: Request, res: Response) {
    const resources = await Resource.findAll({});

    res.json(resources);
  }

  public async create(req: Request, res: Response) {
    const resourceName = ResourcesController.retrieveResourceName(req, res);
    if (resourceName != null) {
      const resourceData = ResourcesController.retrieveResourceData(req, res);

      if (resourceData != null) {
        try {
          const resource = await Resource.create({
            ...resourceData,
            name: resourceName,
          });

          res.status(201).json(resource);
        } catch (error) {
          res.status(500).json(error);
        }
      }
    }
  }

  public async show(req: Request, res: Response) {
    const resource = await this.getResource(req, res);

    res.json(resource);
  }

  public async createWeekday(req: Request, res: Response) {
    const resource = await this.getResource(req, res);

    const weekdayData = WeekdaysController.retrieveWeekdayData(req, res);
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

  public async getWeekdays(req: Request, res: Response) {
    const resource = await this.getResource(req, res);
    const weekdays = resource?.weekdays;

    if (weekdays != null) {
      res.json(weekdays);
    } else {
      res.json([]);
    }
  }

  // noinspection JSMethodCanBeStatic
  private async getResource(req: Request, res: Response): Promise<Resource> {
    const resourceName = ResourcesController.retrieveResourceName(req, res);
    const resource = await Resource.findByPk<Resource>(resourceName, {
      include: [Weekday],
    });

    if (resource != null) {
      return resource;
    } else {
      throw new ControllerError('Resource not found', 404);
    }
  }

  public async update(req: Request, res: Response) {
    const resourceName = ResourcesController.retrieveResourceName(req, res);

    if (resourceName != null) {
      const resourceData = ResourcesController.retrieveResourceData(req, res);
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
    const resourceName: string | null | undefined = req.params.name;

    if (resourceName != null) {
      const options: DestroyOptions = {
        where: { name: resourceName },
        limit: 1,
      };

      try {
        await Resource.destroy(options);

        res.status(204).json({ data: 'success' });
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(500).json({ data: 'Resource not specified.' });
    }
  }

  private static retrieveResourceName(req: Request, _: Response): string {
    const resourceName = req.params.name;
    if (resourceName.length > 0) {
      return resourceName;
    } else {
      throw new ControllerError('No such resource', 500);
    }
  }

  private static retrieveResourceData(
    req: Request,
    res: Response
  ): ResourceInterface | null {
    const resourceData = req.body;
    if (isResourceInterface(resourceData)) {
      return resourceData;
    } else {
      res.status(500).json({ errors: ['Invalid resource data format.'] });
      return null;
    }
  }
}
