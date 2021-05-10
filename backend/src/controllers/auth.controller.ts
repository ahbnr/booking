import { Response } from 'express';
import { boundClass } from 'autobind-decorator';
import {
  asyncJwtSign,
  asyncJwtVerify,
  TokenGenerationResult,
} from '../utils/jwt';
import {
  AuthRequestData,
  checkType,
  DataValidationError,
  EMailString,
  hasProperty,
  InviteForSignupData,
  noRefinementChecks,
  SignupRequestData,
} from 'common/dist';
import { AuthTokenData } from '../types/token-types/AuthTokenData';
import TypesafeRequest from './TypesafeRequest';
import UserDBInterface from '../repositories/model_interfaces/UserDBInterface';
import { AuthResponseData } from 'common/dist/typechecking/api/responses/AuthResponseData';
import RefreshTokensRepository from '../repositories/RefreshTokensRepository';
import { RefreshTokenData } from '../types/token-types/RefreshTokenData';
import UserRepository from '../repositories/UserRepository';

import * as crypto from 'crypto';
import { SignupTokenData } from '../types/token-types/SignupTokenData';
import InviteForSignupResponse from '../types/response-types/InviteForSignupResponse';
import { sendMail } from '../utils/email';
import { DateTime, Duration } from 'luxon';
import { ControllerError } from './errors';

@boundClass
export class AuthController {
  // FIXME: Put this into some global configuration
  private static readonly refreshTokenTimeout: number = 2592000; // 30 days in seconds
  private static readonly authTokenTimeout: number = 900; // 15 minutes in seconds
  private static readonly signupTokenTimeout: number = 259200; // 3 days in seconds

  private readonly userRepository: UserRepository;
  private readonly refreshTokenRepository: RefreshTokensRepository;

  constructor(
    userRepository: UserRepository,
    refreshTokenRepository: RefreshTokensRepository
  ) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  public async login(req: TypesafeRequest, res: Response) {
    const authData = checkType(req.body, AuthRequestData);
    const user = await this.userRepository.findUserByName(authData.username);

    if (user != null) {
      if (await user?.doesPasswordMatch(authData.password)) {
        const token = await this.generateRefreshToken(user);

        res.cookie('refreshToken', token.token, {
          httpOnly: true,
          sameSite: 'strict',
        }); // FIXME: Maybe also add option secure: true
        res.status(200).json();
      } else {
        res.status(401).json('Wrong password.');
      }
    } else {
      res.status(404).json('User not found.');
    }
  }

  public async getAuthToken(
    req: TypesafeRequest,
    res: Response<AuthResponseData | string>
  ) {
    const maybeRefreshToken = req.cookies?.refreshToken;

    if (maybeRefreshToken != null && typeof maybeRefreshToken === 'string') {
      const verifiedToken = await asyncJwtVerify(maybeRefreshToken);
      const tokenData = checkType(verifiedToken, RefreshTokenData);

      const refreshToken = await this.refreshTokenRepository.findRefreshTokenById(
        tokenData.token
      );

      if (refreshToken != null) {
        const user = await refreshToken.getUser();

        if (user.data.name === tokenData.username) {
          // FIXME: Automatically check for expired tokens inside database
          if (!refreshToken.hasExpired()) {
            const tokenResult = await AuthController.generateAuthToken(user);

            res.status(200).json(
              noRefinementChecks<AuthResponseData>({
                authToken: tokenResult.token,
                expiresAt: tokenResult.expiresAt.toISO(),
              })
            );
          } else {
            console.log(
              `Rejected token because it expired. Now: ${DateTime.now().toISO()}. Expiration date: ${refreshToken.expiresAt.toISOString()}`
            );
            res.status(401).json('Invalid refresh token (expired!).');
          }
        } else {
          console.log(
            `Received inconsistent refresh token: The token is for user ${user.data.name}, but the token data specifies user ${tokenData.username}`
          );
          res.status(401).json('Invalid refresh token (wrong user).');
        }
      } else {
        res.status(401).json('Invalid refresh token (maybe expired?)');
      }
    } else {
      res.status(401).json('No refresh token given.');
    }
  }

  public async inviteForSignup(
    req: TypesafeRequest,
    res: Response<InviteForSignupResponse>
  ) {
    const invitationData = checkType(req.body, InviteForSignupData);

    const signupToken = await AuthController.generateSignupToken(
      invitationData.email
    );

    await AuthController.sendSignupMail(
      signupToken.token,
      invitationData.targetUrl,
      invitationData.email
    );

    res.status(200).json({
      signupToken: signupToken.token,
    });
  }

  public async signup(
    req: TypesafeRequest,
    res: Response<AuthResponseData | string>
  ) {
    const data = checkType(req.body, SignupRequestData);

    const signupTokenData = await AuthController.decodeSignupToken(
      data.signupToken
    );

    await this.userRepository.create(data.userData, signupTokenData.email);

    res.status(201).json();
  }

  public async isSignupTokenOk(req: TypesafeRequest, res: Response<boolean>) {
    if (
      typeof req.body === 'object' &&
      req.body != null &&
      hasProperty(req.body, 'signupToken')
    ) {
      try {
        const signupToken = req.body.signupToken;
        await AuthController.decodeSignupToken(signupToken);

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

  private static async sendSignupMail(
    signupToken: string,
    targetUrl: string,
    email: EMailString
  ) {
    await sendMail(
      email,
      'Signup',
      '', // TODO text represenation
      `<a href="${targetUrl}?signupToken=${signupToken}">Signup</a>`
    );
  }

  private static async decodeSignupToken(
    signupToken: unknown
  ): Promise<SignupTokenData> {
    if (typeof signupToken === 'string') {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const decodedToken = await asyncJwtVerify(signupToken, {});

      return checkType(decodedToken, SignupTokenData);
    }

    throw new Error('Could not decode token,');
  }

  private async generateRefreshToken(
    user: UserDBInterface
  ): Promise<TokenGenerationResult> {
    const randomTokenPromise = new Promise<string>((resolve, reject) =>
      crypto.randomBytes(128, (err: Error | null, buffer: Buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer.toString('hex'));
        }
      })
    );

    const tokenId = await randomTokenPromise;

    const data: RefreshTokenData = noRefinementChecks<RefreshTokenData>({
      type: 'RefreshToken',
      token: tokenId,
      username: user.data.name,
    });

    const signedJWT = await asyncJwtSign(data, {
      expiresIn: AuthController.refreshTokenTimeout,
    });

    const dbEntry = await this.refreshTokenRepository.create(
      tokenId,
      user,
      signedJWT.expiresAt.toJSDate()
    );

    if (dbEntry != null) {
      console.log(
        `Created new refresh token for user ${user.data.name} which expires at ${signedJWT.expiresAt}.`
      );

      return signedJWT;
    } else {
      throw new ControllerError(
        'Could not save new refresh token in database.',
        500
      );
    }
  }

  private static async generateAuthToken(
    user: UserDBInterface
  ): Promise<TokenGenerationResult> {
    const data: AuthTokenData = noRefinementChecks<AuthTokenData>({
      type: 'AuthTokenData',
      username: user.data.name,
    });

    return asyncJwtSign(data, { expiresIn: AuthController.authTokenTimeout });
  }

  private static async generateSignupToken(
    email: EMailString
  ): Promise<TokenGenerationResult> {
    const data: SignupTokenData = {
      type: 'SignupToken',
      email: email,
    };

    return asyncJwtSign(data, { expiresIn: AuthController.signupTokenTimeout });
  }
}
