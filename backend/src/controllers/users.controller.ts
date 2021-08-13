import { Response } from 'express';
import { boundClass } from 'autobind-decorator';
import { checkType, hasProperty, NonEmptyString } from 'common/dist';
import { SignupRequestData, UserGetInterface } from 'common';
import TypesafeRequest from './TypesafeRequest';
import UserRepository from '../repositories/UserRepository';
import UserDBInterface from '../repositories/model_interfaces/UserDBInterface';
import { MissingPathParameter } from './errors';
import { delay, inject, singleton } from 'tsyringe';

@singleton()
@boundClass
export class UsersController {
  constructor(
    @inject(delay(() => UserRepository))
    private readonly userRepository: UserRepository
  ) {}

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
