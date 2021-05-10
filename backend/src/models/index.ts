import dbConfig from '../config/db.config';
import { Sequelize } from 'sequelize-typescript';
import UserRepository from '../repositories/UserRepository';
import TimeslotRepository from '../repositories/TimeslotRepository';
import ResourceRepository from '../repositories/ResourceRepository';
import WeekdayRepository from '../repositories/WeekdayRepository';
import BookingRepository from '../repositories/BookingRepository';
import RefreshTokensRepository from '../repositories/RefreshTokensRepository';

export default class DatabaseController {
  public readonly sequelize = new Sequelize(
    dbConfig.db,
    dbConfig.user,
    dbConfig.password,
    dbConfig.sequelize_options
  );

  public readonly repositories = {
    userRepository: new UserRepository(),
    bookingRepository: new BookingRepository(),
    timeslotRepository: new TimeslotRepository(),
    resourceRepository: new ResourceRepository(),
    weekdayRepository: new WeekdayRepository(),
    refreshTokenRepository: new RefreshTokensRepository(),
  };

  async init() {
    await this.sequelize.sync();
    console.log('Synced DB.');

    this.repositories.resourceRepository.init(
      this.repositories.weekdayRepository
    );
    this.repositories.weekdayRepository.init(
      this.repositories.timeslotRepository
    );
    this.repositories.timeslotRepository.init(
      this.repositories.bookingRepository,
      this.repositories.weekdayRepository
    );
    this.repositories.bookingRepository.init(
      this.repositories.resourceRepository,
      this.repositories.timeslotRepository
    );
    this.repositories.refreshTokenRepository.init();

    await this.repositories.userRepository.initRootUser();
  }
}
