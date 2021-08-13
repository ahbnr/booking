import { Response } from 'express';
import { boundClass } from 'autobind-decorator';
import { checkType } from 'common/dist';
import TypesafeRequest from './TypesafeRequest';
import SettingsRepository from '../repositories/SettingsRepository';
import {
  SettingsGetInterface,
  SettingsPostInterface,
} from 'common/dist/typechecking/api/Settings';
import { delay, inject, singleton } from 'tsyringe';

@singleton()
@boundClass
export class SettingsController {
  constructor(
    @inject(delay(() => SettingsRepository))
    private readonly settingsRepository: SettingsRepository
  ) {}

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
