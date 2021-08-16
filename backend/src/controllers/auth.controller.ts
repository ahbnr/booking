import { CookieOptions, Response } from 'express';
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

import { SignupTokenData } from '../types/token-types/SignupTokenData';
import { DateTime } from 'luxon';
import { ControllerError } from './errors';
import asyncRandomBytes from '../utils/cryptoRandomBytes';
import { delay, inject, singleton } from 'tsyringe';
import { MailTransporter } from '../mail/MailTransporter';
import BackendConfig from '../booking-backend.config';
import {
  InviteForSignupFailureData,
  InviteForSignupResponseData,
  InviteForSignupSuccessData,
  SignupFailureData,
  SignupResponseData,
  SignupSuccessData,
} from 'common';

class RefreshTokenGenerationResult {
  public readonly signedJWT: TokenGenerationResult;
  public readonly activation: string;

  constructor(signedJWT: TokenGenerationResult, activation: string) {
    this.signedJWT = signedJWT;
    this.activation = activation;
  }
}

class RefreshTokenCookieOptions {
  public readonly refreshTokenOptions: CookieOptions;
  public readonly refreshTokenActivationOptions: CookieOptions;

  constructor(
    refreshTokenOptions: CookieOptions,
    refreshTokenActivationOptions: CookieOptions
  ) {
    this.refreshTokenOptions = refreshTokenOptions;
    this.refreshTokenActivationOptions = refreshTokenActivationOptions;
  }
}

@singleton()
@boundClass
export class AuthController {
  // FIXME: Put this into some global configuration
  private static readonly refreshTokenTimeout: number = 2592000; // 30 days in seconds
  private static readonly authTokenTimeout: number = 900; // 15 minutes in seconds
  private static readonly signupTokenTimeout: number = 259200; // 3 days in seconds

  constructor(
    @inject(delay(() => UserRepository))
    private readonly userRepository: UserRepository,

    @inject(delay(() => RefreshTokensRepository))
    private readonly refreshTokenRepository: RefreshTokensRepository,

    @inject('MailTransporter')
    private readonly mailTransporter: MailTransporter
  ) {}

  public async login(req: TypesafeRequest, res: Response) {
    const authData = checkType(req.body, AuthRequestData);
    const user = await this.userRepository.findUserByName(authData.username);

    if (user != null) {
      if (await user?.doesPasswordMatch(authData.password)) {
        const tokenGeneration = await this.generateRefreshToken(user);

        const cookieOptions = this.buildRefreshActivationCookieOptions(
          tokenGeneration.signedJWT.createdAt,
          tokenGeneration.signedJWT.expiresAt
        );

        res.cookie(
          'refreshToken',
          tokenGeneration.signedJWT.token,
          cookieOptions.refreshTokenOptions
        );
        res.cookie(
          'refreshTokenActivation',
          tokenGeneration.activation,
          cookieOptions.refreshTokenActivationOptions
        );

        res.status(200).json();
      } else {
        res.status(401).json('Wrong password.');
      }
    } else {
      res.status(404).json('User not found.');
    }
  }

  private buildRefreshActivationCookieOptions(
    createdAt: DateTime,
    expiresAt: DateTime
  ): RefreshTokenCookieOptions {
    const maxAge = expiresAt.diff(createdAt, ['seconds']).seconds;

    // FIXME: Maybe also add option secure: true
    const refreshTokenOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: maxAge,
      secure: true,
    };

    const refreshTokenActivationOptions: CookieOptions = {
      sameSite: 'strict',
      maxAge: maxAge,
      secure: true,
    };

    return new RefreshTokenCookieOptions(
      refreshTokenOptions,
      refreshTokenActivationOptions
    );
  }

  public async logout(req: TypesafeRequest, res: Response) {
    const maybeRefreshToken = req.cookies?.refreshToken;

    if (
      maybeRefreshToken != null &&
      typeof maybeRefreshToken === 'string' &&
      maybeRefreshToken.length > 0
    ) {
      const verifiedToken = await asyncJwtVerify(maybeRefreshToken);
      const tokenData = checkType(verifiedToken, RefreshTokenData);

      const refreshToken = await this.refreshTokenRepository.findRefreshTokenById(
        tokenData.token
      );

      if (refreshToken != null) {
        const cookieOptions = this.buildRefreshActivationCookieOptions(
          DateTime.fromJSDate(refreshToken.createdAt),
          DateTime.fromJSDate(refreshToken.expiresAt)
        );

        await this.refreshTokenRepository.destroy(refreshToken.tokenId);

        res.clearCookie('refreshToken', cookieOptions.refreshTokenOptions);
        res.clearCookie(
          'refreshTokenActivation',
          cookieOptions.refreshTokenActivationOptions
        );
      }
    }

    res.status(200).json({});
  }

  public async getAuthToken(
    req: TypesafeRequest,
    res: Response<AuthResponseData | string>
  ) {
    const maybeRefreshToken = req.cookies?.refreshToken;

    if (
      maybeRefreshToken != null &&
      typeof maybeRefreshToken === 'string' &&
      maybeRefreshToken.length > 0
    ) {
      const verifiedToken = await asyncJwtVerify(maybeRefreshToken);
      const tokenData = checkType(verifiedToken, RefreshTokenData);

      const refreshToken = await this.refreshTokenRepository.findRefreshTokenById(
        tokenData.token
      );

      if (refreshToken != null) {
        const maybeActivation = req.cookies?.refreshTokenActivation;

        if (
          maybeActivation != null &&
          typeof maybeActivation === 'string' &&
          maybeActivation === refreshToken.activation
        ) {
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
          await this.refreshTokenRepository.destroy(refreshToken.tokenId);

          res
            .status(401)
            .json(
              'Activation code missing or invalid. Invalidated refresh token.'
            );
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
    res: Response<InviteForSignupResponseData>
  ) {
    const invitationData = checkType(req.body, InviteForSignupData);

    const existingUserWithEMail = await this.userRepository.findUserByEMail(
      invitationData.email
    );

    if (existingUserWithEMail == null) {
      const signupToken = await AuthController.generateSignupToken(
        invitationData.email
      );

      await this.sendSignupMail(
        signupToken.token,
        invitationData.targetUrl,
        invitationData.email
      );

      res.status(200).json(
        noRefinementChecks<InviteForSignupSuccessData>({
          kind: 'success',
          signupToken: signupToken.token,
        })
      );
    } else {
      res.status(409).json(
        noRefinementChecks<InviteForSignupFailureData>({
          kind: 'failure',
        })
      );
    }
  }

  public async signup(req: TypesafeRequest, res: Response<SignupResponseData>) {
    const data = checkType(req.body, SignupRequestData);

    const signupTokenData = await AuthController.decodeSignupToken(
      data.signupToken
    );

    const existingUserWithName = await this.userRepository.findUserByName(
      data.userData.name
    );

    if (existingUserWithName == null) {
      const existingUserWithEmail = await this.userRepository.findUserByEMail(
        signupTokenData.email
      );

      if (existingUserWithEmail == null) {
        await this.userRepository.create(data.userData, signupTokenData.email);

        res.status(201).json(
          noRefinementChecks<SignupSuccessData>({
            kind: 'success',
          })
        );
      } else {
        res.status(409).json(
          noRefinementChecks<SignupFailureData>({
            kind: 'failure',
            reason: 'existing_mail',
          })
        );
      }
    } else {
      res.status(409).json(
        noRefinementChecks<SignupFailureData>({
          kind: 'failure',
          reason: 'existing_name',
        })
      );
    }
  }

  public async isSignupTokenOk(req: TypesafeRequest, res: Response<boolean>) {
    if (
      typeof req.body === 'object' &&
      req.body != null &&
      hasProperty(req.body, 'signupToken')
    ) {
      try {
        const signupToken = req.body.signupToken;
        const decoded = await AuthController.decodeSignupToken(signupToken);

        const maybeUserWithSameMail = await this.userRepository.findUserByEMail(
          decoded.email
        );

        // you can not register if a user with that mail is already registered
        if (maybeUserWithSameMail == null) {
          res.json(true);
        } else {
          res.json(false);
        }
      } catch (e) {
        res.json(false);
      }
    } else {
      throw new DataValidationError(
        'Request body does not carry signup token.'
      );
    }
  }

  private async sendSignupMail(
    signupToken: string,
    targetUrl: string,
    email: EMailString
  ) {
    await this.mailTransporter.send(
      email,
      'Admin Registrierung',
      `
        Hallo!
        
        Sie wurden als Administrator eingeladen für den Buchungsdienst der ${BackendConfig.organization}.
        Bitte klicken Sie auf den folgenden Link um einen Benutzernamen und ein Passwort zu registrieren:
        
        ${targetUrl}?signupToken=${signupToken}
          
        Vielen Dank!
      `,
      `
        <p>Hallo!</p>
        
        <p>
        Sie wurden als Administrator eingeladen für den Buchungsdienst der ${BackendConfig.organization}.
        Bitte klicken Sie auf den folgenden Link um einen Benutzernamen und ein Passwort zu registrieren:
        </p>
        <center>
          <a href="${targetUrl}?signupToken=${signupToken}">Registrieren</a>
        </center>
        <p>
            Vielen Dank!
        </p>
      `
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
  ): Promise<RefreshTokenGenerationResult> {
    const tokenId = (await asyncRandomBytes(128)).toString('hex');
    const activation = (await asyncRandomBytes(128)).toString('hex');

    const data: RefreshTokenData = noRefinementChecks<RefreshTokenData>({
      type: 'RefreshToken',
      token: tokenId,
      activation: activation,
      username: user.data.name,
    });

    const signedJWT = await asyncJwtSign(data, {
      expiresIn: AuthController.refreshTokenTimeout,
    });

    const dbEntry = await this.refreshTokenRepository.create(
      tokenId,
      activation,
      user,
      signedJWT.expiresAt.toJSDate(),
      signedJWT.createdAt.toJSDate()
    );

    if (dbEntry != null) {
      console.log(
        `Created new refresh token for user ${user.data.name} which expires at ${signedJWT.expiresAt}.`
      );

      return new RefreshTokenGenerationResult(signedJWT, activation);
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
