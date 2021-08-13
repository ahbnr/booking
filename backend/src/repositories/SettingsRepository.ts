import { UniqueConstraintError } from 'sequelize';
import { DataIdAlreadyExists } from './errors';
import { boundClass } from 'autobind-decorator';
import SettingsDBInterface from './model_interfaces/SettingsDBInterface';
import { Settings } from '../models/settings.model';
import { SettingsPostInterface } from 'common/dist/typechecking/api/Settings';
import { singleton } from 'tsyringe';

@singleton()
@boundClass
export default class SettingsRepository {
  private toInterface(settings: Settings): SettingsDBInterface {
    return new SettingsDBInterface(settings, this);
  }

  private async getOrCreate(): Promise<Settings> {
    let settings = await Settings.findOne();

    if (settings == null) {
      settings = await this.create();
    }

    return settings;
  }

  public async get(): Promise<SettingsDBInterface> {
    const settings = await this.getOrCreate();

    return this.toInterface(settings);
  }

  private async create(): Promise<Settings> {
    try {
      const settings = await Settings.create({
        id: 0,
      });

      return settings;
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new DataIdAlreadyExists();
      }

      throw e;
    }
  }

  public async update(
    settingsData: SettingsPostInterface
  ): Promise<SettingsDBInterface> {
    const settings = await this.getOrCreate();
    const updatedSettings = await settings.update(settingsData);

    return this.toInterface(updatedSettings);
  }
}
