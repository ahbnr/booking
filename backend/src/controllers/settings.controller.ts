import { Response } from 'express';
import { ElementNotFound, MissingPathParameter } from './errors';
import { boundClass } from 'autobind-decorator';
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
import SettingsRepository from '../repositories/SettingsRepository';
import {
  SettingsGetInterface,
  SettingsPostInterface,
} from 'common/dist/typechecking/api/Settings';

@boundClass
export class SettingsController {
  private readonly settingsRepository: SettingsRepository;

  constructor(settingsRepository: SettingsRepository) {
    this.settingsRepository = settingsRepository;
  }

  public async show(req: TypesafeRequest, res: Response<SettingsGetInterface>) {
    const settings = await this.settingsRepository.get();

    res.json(await settings.toGetInterface());
  }

  public async update(req: TypesafeRequest, res: Response) {
    const settingsData = checkType(req.body, SettingsPostInterface);

    const updatedSettings = await this.settingsRepository.update(settingsData);

    res.status(202).json(await updatedSettings.toGetInterface());
  }
}
