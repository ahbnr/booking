import { Sequelize } from 'sequelize-typescript';
import { boundClass } from 'autobind-decorator';
import { delay, inject, singleton } from 'tsyringe';
import UserRepository from '../repositories/UserRepository';
import { getSequelizeOptions } from '../config/db.config';

@singleton()
@boundClass
export default class DatabaseController {
  public readonly sequelize: Sequelize;

  constructor(
    @inject(delay(() => UserRepository))
    private readonly userRepository: UserRepository
  ) {
    const sequelizeOptions = getSequelizeOptions();

    this.sequelize = new Sequelize(sequelizeOptions);
  }

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
