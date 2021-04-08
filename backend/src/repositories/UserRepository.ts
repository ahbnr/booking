import { User } from '../models/user.model';
import { boundClass } from 'autobind-decorator';
import { EMailString, UserPostInterface } from 'common/dist';
import { Resource } from '../models/resource.model';
import { UniqueConstraintError } from 'sequelize';
import { DataIdAlreadyExists } from './errors';

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

  public async findUserByName(name: string): Promise<User | null> {
    const user = await User.findByPk<User>(name);

    return user;
  }

  public async create(
    userData: UserPostInterface,
    email?: EMailString
  ): Promise<User> {
    try {
      const user = await User.create({
        ...userData, // dont worry, the sequelize hooks will hash the password
        email: email,
      });

      return user;
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new DataIdAlreadyExists();
      }

      throw e;
    }
  }
}
