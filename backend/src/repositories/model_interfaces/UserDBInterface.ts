import bcrypt from 'bcrypt';
import { User } from '../../models/user.model';
import { noRefinementChecks, UserData } from 'common/dist';
import { LazyGetter } from 'lazy-get-decorator';

export default class UserDBInterface {
  private readonly user: User;

  constructor(user: User) {
    this.user = user;
  }

  @LazyGetter()
  public get data(): UserData {
    return noRefinementChecks<UserData>({
      name: this.user.name,
      email: this.user.email,
      password: this.user.password,
    });
  }

  public async doesPasswordMatch(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.user.password);
  }
}
