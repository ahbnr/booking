import { hasProperty } from '../utils/typechecking';
import { User } from '../models/user.model';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/passport';
//import password from 'secure-random-password';

export class UsersController {
  public static async initRootUser() {
    if ((await User.findByPk('root')) == null) {
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

  public async auth(req: Request, res: Response) {
    if (
      typeof req.body === 'object' &&
      req.body != null &&
      hasProperty(req.body, 'user') &&
      typeof req.body.user === 'string' &&
      hasProperty(req.body, 'password') &&
      typeof req.body.password === 'string'
    ) {
      const username = req.body.user;
      const password = req.body.password;

      const user = await User.findByPk(username);

      if (user != null) {
        if (await user?.doesPasswordMatch(password)) {
          const token = jwt.sign({ username: user.name }, jwtSecret);

          res
            .status(200)
            .json({ message: 'Authentication successful', jwt: token });
        } else {
          res.status(401).json({ message: 'Wrong password.' });
        }
      } else {
        res.status(401).json({ message: 'User not found.' });
      }
    } else {
      res
        .status(401)
        .json({ message: 'Invalid authentication message format.' });
    }
  }
}
