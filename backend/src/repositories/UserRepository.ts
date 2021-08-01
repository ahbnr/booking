import { User } from '../models/user.model';
import { boundClass } from 'autobind-decorator';
import { EMailString, UserPostInterface } from 'common/dist';
import { UniqueConstraintError } from 'sequelize';
import { DataIdAlreadyExists, NoElementToDestroy } from './errors';
import UserDBInterface from './model_interfaces/UserDBInterface';
import password from 'secure-random-password';
const { DEV_MODE } = process.env;

@boundClass
export default class UserRepository {
  public async initRootUser() {
    if ((await this.findUserByName('root')) == null) {
      let generatedPassword;
      if (DEV_MODE === '1') {
        generatedPassword = 'root';
      } else {
        generatedPassword = password.randomPassword();
      }

      await User.create({
        name: 'root',
        password: generatedPassword,
      });

      console.log(
        `\n\nCreated "root" user with password ${generatedPassword}. Remember this password and erase this log!\n\n`
      );
    }
  }

  private toInterface(user: User): UserDBInterface {
    return new UserDBInterface(user);
  }

  public async findUserByName(name: string): Promise<UserDBInterface | null> {
    const user = await User.findByPk<User>(name);

    if (user != null) {
      return this.toInterface(user);
    }

    return null;
  }

  public async findAll(): Promise<UserDBInterface[]> {
    const users = await User.findAll({});

    return users.map(this.toInterface);
  }

  public async create(
    userData: UserPostInterface,
    email?: EMailString
  ): Promise<UserDBInterface> {
    try {
      const user = await User.create({
        ...userData, // dont worry, the sequelize hooks will hash the password
        email: email,
      });

      return this.toInterface(user);
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new DataIdAlreadyExists();
      }

      throw e;
    }
  }

  public async destroy(userName: string) {
    const userToDestroy = await User.findByPk(userName);

    if (userToDestroy != null) {
      userToDestroy.destroy();
    } else {
      throw new NoElementToDestroy('user');
    }
  }
}
