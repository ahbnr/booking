import { boundClass } from 'autobind-decorator';
import RefreshTokenDBInterface from './model_interfaces/RefreshTokenDBInterface';
import UserDBInterface from './model_interfaces/UserDBInterface';
import { RefreshToken } from '../models/refreshtoken.model';

@boundClass
export default class RefreshTokensRepository {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

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
    user: UserDBInterface,
    expiresAt: Date
  ): Promise<RefreshTokenDBInterface> {
    // FIXME: Delete old tokens of same client

    const refreshToken = await RefreshToken.create<RefreshToken>({
      token: refreshTokenId,
      userName: user.data.name,
      expiresAt: expiresAt,
    });

    return this.toInterface(refreshToken);
  }

  public async getUserOfRefreshToken(
    refreshToken: RefreshToken
  ): Promise<UserDBInterface> {
    return new UserDBInterface(await refreshToken.lazyUser);
  }
}
