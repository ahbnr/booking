import { User } from '../models/user.model';
import { Request, Response } from 'express';
import { jwtSecret } from '../config/passport';
//import password from 'secure-random-password';
import { boundClass } from 'autobind-decorator';
import { sendMail } from '../utils/email';
import { asyncJwtSign, asyncJwtVerify } from '../utils/jwt';
import {
  checkType,
  DataValidationError,
  EMailString,
  InviteForSignupData,
  noRefinementChecks,
} from 'common/dist';
import { SignupTokenData } from '../types/token-types/SignupTokenData';
import { AuthTokenData } from '../types/token-types/AuthTokenData';
import { AuthRequestData, SignupRequestData } from 'common';
import { TokenDecodeError } from '../types/errors/TokenDecodeError';

@boundClass
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

  private static async makeSignupToken(email: EMailString): Promise<string> {
    const data: SignupTokenData = {
      type: 'SignupToken',
      email: email,
    };

    return await asyncJwtSign(data, jwtSecret, {});
  }

  private static async sendSignupMail(targetUrl: string, email: EMailString) {
    const signupToken = await UsersController.makeSignupToken(email);

    await sendMail(
      email,
      'Signup',
      '', // TODO text represenation
      `<a href="${targetUrl}?token=${signupToken}">Signup</a>`
    );
  }

  public async inviteForSignup(req: Request, res: Response) {
    const invitationData = checkType(req.body, InviteForSignupData);

    await UsersController.sendSignupMail(
      invitationData.targetUrl,
      invitationData.email
    );

    res.status(200).json({});
  }

  public async signup(req: Request, res: Response<string>) {
    const data = checkType(req.body, SignupRequestData);

    const email = await UsersController.decodeSignupToken(data.signupToken);

    const user = await User.create({
      ...data.userData, // dont worry, the sequelize hooks will hash the password
      email: email,
    });

    const authToken = await UsersController.getAuthToken(user);

    res.json(authToken);
  }

  private static async getAuthToken(user: User): Promise<string> {
    const data: AuthTokenData = noRefinementChecks<AuthTokenData>({
      type: 'AuthTokenData',
      username: user.name,
    });

    return await asyncJwtSign(data, jwtSecret, {});
  }

  public async isSignupTokenOk(req: Request, res: Response<boolean>) {
    try {
      const signupToken = req.body.token;
      await UsersController.decodeSignupToken(signupToken);

      res.json(true);
    } catch (e) {
      res.json(false);
    }
  }

  private static async decodeSignupToken(
    signupToken: unknown
  ): Promise<SignupTokenData> {
    if (typeof signupToken === 'string') {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const decodedToken = await asyncJwtVerify(signupToken, jwtSecret, {});

      return checkType(decodedToken, SignupTokenData);
    }

    throw new Error('Could not decode token,');
  }

  public async auth(req: Request, res: Response<string | { message: string }>) {
    const authData = checkType(req.body, AuthRequestData);

    const user = await User.findByPk(authData.username);

    if (user != null) {
      if (await user?.doesPasswordMatch(authData.password)) {
        const token = await UsersController.getAuthToken(user);

        res.status(200).json(token);
      } else {
        res.status(401).json({ message: 'Wrong password.' });
      }
    } else {
      res.status(401).json({ message: 'User not found.' });
    }
  }
}
