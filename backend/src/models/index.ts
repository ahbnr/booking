import dbConfig from '../config/db.config';
import { Sequelize } from 'sequelize-typescript';
import UserRepository from '../repositories/UserRepository';
import TimeslotRepository from '../repositories/TimeslotRepository';
import ResourceRepository from '../repositories/ResourceRepository';
import WeekdayRepository from '../repositories/WeekdayRepository';
import BookingRepository from '../repositories/BookingRepository';
import RefreshTokensRepository from '../repositories/RefreshTokensRepository';
import { boundClass } from 'autobind-decorator';
import SettingsRepository from '../repositories/SettingsRepository';
import { container } from 'tsyringe';

@boundClass
export default class DatabaseController {
  public readonly sequelize = new Sequelize(
    dbConfig.db,
    dbConfig.user,
    dbConfig.password,
    dbConfig.sequelize_options
  );

  public readonly repositories = {
    userRepository: container.resolve(UserRepository),
    bookingRepository: container.resolve(BookingRepository),
    timeslotRepository: container.resolve(TimeslotRepository),
    resourceRepository: container.resolve(ResourceRepository),
    weekdayRepository: container.resolve(WeekdayRepository),
    refreshTokenRepository: container.resolve(RefreshTokensRepository),
    settingsRepository: container.resolve(SettingsRepository),
  };

  async init() {
    await this.sequelize.sync();
    console.log('Synced DB.');

    await this.repositories.userRepository.initRootUser();
  }

  async reset() {
    await this.sequelize.drop();

    await this.init();
  }
}
