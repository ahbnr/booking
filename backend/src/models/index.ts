import dbConfig from '../config/db.config';
import { Sequelize } from 'sequelize-typescript';
import { boundClass } from 'autobind-decorator';
import { delay, inject, singleton } from 'tsyringe';
import UserRepository from '../repositories/UserRepository';

@singleton()
@boundClass
export default class DatabaseController {
  constructor(
    @inject(delay(() => UserRepository))
    private readonly userRepository: UserRepository
  ) {}

  public readonly sequelize = new Sequelize(
    dbConfig.db,
    dbConfig.user,
    dbConfig.password,
    dbConfig.sequelize_options
  );

  async init() {
    await this.sequelize.sync();
    console.log('Synced DB.');

    await this.userRepository.initRootUser();
  }

  async reset() {
    await this.sequelize.drop();

    await this.init();
  }
}
