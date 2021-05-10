import { Response } from 'express';
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
  NonEmptyString,
  noRefinementChecks,
} from 'common/dist';
import { SignupTokenData } from '../types/token-types/SignupTokenData';
import { SignupRequestData, UserGetInterface } from 'common';
import TypesafeRequest from './TypesafeRequest';
import UserRepository from '../repositories/UserRepository';
import UserDBInterface from '../repositories/model_interfaces/UserDBInterface';
import InviteForSignupResponse from '../types/response-types/InviteForSignupResponse';
import { AuthResponseData } from 'common/dist/typechecking/api/responses/AuthResponseData';
import { MissingPathParameter } from './errors';

@boundClass
export class UsersController {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  private static usersAsGetInterfaces(
    users: UserDBInterface[]
  ): UserGetInterface[] {
    return users.map((user) => user.toGetInterface());
  }

  public async index(req: TypesafeRequest, res: Response<UserGetInterface[]>) {
    const users = await this.userRepository.findAll();

    res.json(UsersController.usersAsGetInterfaces(users));
  }

  public async delete(req: TypesafeRequest, res: Response) {
    const userName = UsersController.retrieveUserName(req);

    await this.userRepository.destroy(userName);

    res.status(204).json('success');
  }

  private static retrieveUserName(req: TypesafeRequest): NonEmptyString {
    if (hasProperty(req.params, 'name')) {
      return checkType(req.params.name, NonEmptyString);
    } else {
      throw new MissingPathParameter('name');
    }
  }
}
