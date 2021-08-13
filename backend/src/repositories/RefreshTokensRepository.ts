import { boundClass } from 'autobind-decorator';
import RefreshTokenDBInterface from './model_interfaces/RefreshTokenDBInterface';
import UserDBInterface from './model_interfaces/UserDBInterface';
import { RefreshToken } from '../models/refreshtoken.model';
import { NoElementToDestroy } from './errors';
import { singleton } from 'tsyringe';

@singleton()
@boundClass
export default class RefreshTokensRepository {
  private toInterface(refreshToken: RefreshToken): RefreshTokenDBInterface {
    return new RefreshTokenDBInterface(refreshToken, this);
  }

  public async findRefreshTokenById(
    tokenId: string
  ): Promise<RefreshTokenDBInterface | null> {
    const refreshToken = await RefreshToken.findByPk<RefreshToken>(tokenId);

    if (refreshToken != null) {
      return this.toInterface(refreshToken);
    }

    return null;
  }

  public async create(
    refreshTokenId: string,
    activation: string,
    user: UserDBInterface,
    expiresAt: Date,
    createdAt: Date
  ): Promise<RefreshTokenDBInterface> {
    // FIXME: Delete old tokens of same client

    const refreshToken = await RefreshToken.create<RefreshToken>({
      token: refreshTokenId,
      activation: activation,
      userName: user.data.name,
      expiresAt: expiresAt,
      createdAt: createdAt,
    });

    return this.toInterface(refreshToken);
  }

  public async destroy(tokenId: string) {
    const refreshTokenToDestroy = await RefreshToken.findByPk(tokenId);

    if (refreshTokenToDestroy != null) {
      refreshTokenToDestroy.destroy();
    } else {
      throw new NoElementToDestroy('RefreshToken');
    }
  }

  public async getUserOfRefreshToken(
    refreshToken: RefreshToken
  ): Promise<UserDBInterface> {
    return new UserDBInterface(await refreshToken.lazyUser);
  }
}
