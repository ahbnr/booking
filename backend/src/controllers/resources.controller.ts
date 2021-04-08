import { Response } from 'express';
import { ElementNotFound, MissingPathParameter } from './errors';
import { boundClass } from 'autobind-decorator';
import { Resource } from '../models/resource.model';
import {
  checkType,
  hasProperty,
  NonEmptyString,
  ResourceGetInterface,
  ResourcePostInterface,
  WeekdayGetInterface,
  WeekdayPostInterface,
} from 'common/dist';
import ResourceRepository from '../repositories/ResourceRepository';
import TypesafeRequest from './TypesafeRequest';
import WeekdayRepository from '../repositories/WeekdayRepository';
import ResourceDBInterface from '../repositories/model_interfaces/ResourceDBInterface';

@boundClass
export class ResourcesController {
  private readonly resourceRepository: ResourceRepository;
  private readonly weekdayRepository: WeekdayRepository;

  constructor(
    resourceRepository: ResourceRepository,
    weekdayRepository: WeekdayRepository
  ) {
    this.resourceRepository = resourceRepository;
    this.weekdayRepository = weekdayRepository;
  }

  public async index(
    req: TypesafeRequest,
    res: Response<ResourceGetInterface[]>
  ) {
    const resources = await this.resourceRepository.findAll();

    res.json(
      await Promise.all(resources.map((resource) => resource.toGetInterface()))
    );
  }

  public async create(
    req: TypesafeRequest,
    res: Response<ResourceGetInterface>
  ) {
    const resourceName = ResourcesController.retrieveResourceName(req);
    const resourceData = checkType(req.body, ResourcePostInterface);

    const resource = await this.resourceRepository.create(
      resourceName,
      resourceData
    );

    res.status(201).json(await resource.toGetInterface());
  }

  public async show(req: TypesafeRequest, res: Response<ResourceGetInterface>) {
    const resource = await this.getResource(req);

    res.json(await resource.toGetInterface());
  }

  public async createWeekday(
    req: TypesafeRequest,
    res: Response<WeekdayGetInterface>
  ) {
    const resource = await this.getResource(req);

    const weekdayData = checkType(req.body, WeekdayPostInterface);
    const weekday = await this.weekdayRepository.create(resource, weekdayData);

    res.status(201).json(await weekday.toGetInterface());
  }

  public async getWeekdays(
    req: TypesafeRequest,
    res: Response<WeekdayGetInterface[]>
  ) {
    const resource = await this.getResource(req);
    const weekdays = await resource?.getWeekdays();

    const getInterfaces = await Promise.all(
      weekdays.map((weekday) => weekday.toGetInterface())
    );

    res.json(getInterfaces);
  }

  public async update(req: TypesafeRequest, res: Response) {
    const resourceName = ResourcesController.retrieveResourceName(req);
    const resourceData = checkType(req.body, ResourcePostInterface);

    await this.resourceRepository.update(resourceName, resourceData);

    res.status(202).json('accepted');
  }

  public async delete(req: TypesafeRequest, res: Response) {
    const resourceName = ResourcesController.retrieveResourceName(req);

    await this.resourceRepository.destroy(resourceName);

    res.status(204).json('success');
  }

  private static retrieveResourceName(req: TypesafeRequest): NonEmptyString {
    if (hasProperty(req.params, 'name')) {
      return checkType(req.params.name, NonEmptyString);
    } else {
      throw new MissingPathParameter('name');
    }
  }

  private async getResource(
    req: TypesafeRequest
  ): Promise<ResourceDBInterface> {
    const resourceName = ResourcesController.retrieveResourceName(req);
    const resource = await this.resourceRepository.findByName(resourceName);

    if (resource != null) {
      return resource;
    } else {
      throw new ElementNotFound('resource');
    }
  }
}
