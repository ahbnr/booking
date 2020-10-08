import { EMail, hasProperty, validateJson } from '../utils/typechecking';
import { isUserInterface, User } from '../models/user.model';
import { Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { jwtSecret } from '../config/passport';
//import password from 'secure-random-password';
import nodemailer from 'nodemailer';
import * as t from 'io-ts';
import { boundClass } from 'autobind-decorator';
import { sendMail } from '../utils/email';
import { asyncJwtSign, asyncJwtVerify } from '../utils/jwt';

const InviteForSignupData = t.type({
  email: EMail,
  targetUrl: t.string,
});

type InviteForSignupData = t.TypeOf<typeof InviteForSignupData>;

const SignupTokenData = t.type({
  type: t.literal('SignupToken'),
  email: EMail,
});

type SignupTokenData = t.TypeOf<typeof SignupTokenData>;

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

  private async makeSignupToken(email: EMail): Promise<string> {
    const data: SignupTokenData = {
      type: 'SignupToken',
      email: email,
    };

    const signupToken = await asyncJwtSign(data, jwtSecret, {});

    return signupToken;
  }

  private async sendSignupMail(targetUrl: string, email: EMail) {
    const signupToken = await this.makeSignupToken(email);

    await sendMail(
      email,
      'Signup',
      '', // TODO text represenation
      `<a href="${targetUrl}?token=${signupToken}">Signup</a>`
    );
  }

  public async inviteForSignup(req: Request, res: Response) {
    const invitationData = validateJson(InviteForSignupData, req.body);

    await this.sendSignupMail(invitationData.targetUrl, invitationData.email);

    res.status(200).json({});
  }

  public async signup(req: Request, res: Response) {
    try {
      const signupToken = req.body.token;

      const email = await this.decodeSignupToken(signupToken);

      if (isUserInterface(req.body)) {
        const data = req.body;

        const user = await User.create({
          ...data, // dont worry, the sequelize hooks will hash the password
          email: email,
        });

        const authToken = await this.getAuthToken(user);

        res.json({ message: 'Signup successful', jwt: authToken });
      } else {
        res.status(401).json({ message: 'Invalid data' });
      }
    } catch (e) {
      res.status(401).json(e);
    }
  }

  private getAuthToken(user: User): Promise<string> {
    return new Promise<string>((resolve, reject) =>
      jwt.sign({ username: user.name }, jwtSecret, {}, (err, token) => {
        if (err != null) {
          reject(err);
        } else if (token != null) {
          resolve(token);
        } else {
          reject('Could not create token');
        }
      })
    );
  }

  public async isSignupTokenOk(req: Request, res: Response) {
    try {
      const signupToken = req.body.token;
      await this.decodeSignupToken(signupToken);

      res.json(true);
    } catch (e) {
      res.json(false);
    }
  }

  private async decodeSignupToken(signupToken: unknown): Promise<string> {
    if (typeof signupToken === 'string') {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const decodedToken = await asyncJwtVerify(signupToken, jwtSecret, {});

      const validatedToken = validateJson(SignupTokenData, decodedToken);

      return validatedToken.email;
    }

    throw new Error('Could not decode token,');
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
          const token = await this.getAuthToken(user);

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
