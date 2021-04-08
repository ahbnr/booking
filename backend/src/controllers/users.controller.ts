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
  hasProperty,
  InviteForSignupData,
  noRefinementChecks,
} from 'common/dist';
import { SignupTokenData } from '../types/token-types/SignupTokenData';
import { AuthTokenData } from '../types/token-types/AuthTokenData';
import { AuthRequestData, SignupRequestData } from 'common';
import TypesafeRequest from './TypesafeRequest';
import UserRepository from '../repositories/UserRepository';

@boundClass
export class UsersController {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
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

  public async inviteForSignup(req: TypesafeRequest, res: Response) {
    const invitationData = checkType(req.body, InviteForSignupData);

    await UsersController.sendSignupMail(
      invitationData.targetUrl,
      invitationData.email
    );

    res.status(200).json('Ok');
  }

  public async signup(req: TypesafeRequest, res: Response<string>) {
    const data = checkType(req.body, SignupRequestData);

    const signupTokenData = await UsersController.decodeSignupToken(
      data.signupToken
    );

    const user = await this.userRepository.create(
      data.userData,
      signupTokenData.email
    );

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

  public async isSignupTokenOk(req: TypesafeRequest, res: Response<boolean>) {
    if (
      typeof req.body === 'object' &&
      req.body != null &&
      hasProperty(req.body, 'token')
    ) {
      try {
        const signupToken = req.body.token;
        await UsersController.decodeSignupToken(signupToken);

        res.json(true);
      } catch (e) {
        res.json(false);
      }
    } else {
      throw new DataValidationError(
        'Request body does not carry signup token.'
      );
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

  public async auth(req: TypesafeRequest, res: Response<string>) {
    const authData = checkType(req.body, AuthRequestData);

    const user = await this.userRepository.findUserByName(authData.username);

    if (user != null) {
      if (await user?.doesPasswordMatch(authData.password)) {
        const token = await UsersController.getAuthToken(user);

        res.status(200).json(token);
      } else {
        res.status(401).json('Wrong password.');
      }
    } else {
      res.status(404).json('User not found.');
    }
  }
}
