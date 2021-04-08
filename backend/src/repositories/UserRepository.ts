import { User } from '../models/user.model';
import { boundClass } from 'autobind-decorator';
import { EMailString, UserPostInterface } from 'common/dist';
import sequelize, { UniqueConstraintError } from 'sequelize';
import { DataIdAlreadyExists } from './errors';
import UserDBInterface from './model_interfaces/UserDBInterface';

@boundClass
export default class UserRepository {
  public async initRootUser() {
    if ((await this.findUserByName('root')) == null) {
      //const generatedPassword = password.randomPassword();
      const generatedPassword = 'root';

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
}
