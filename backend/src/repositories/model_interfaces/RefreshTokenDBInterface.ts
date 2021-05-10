import { RefreshToken } from '../../models/refreshtoken.model';
import RefreshTokensRepository from '../RefreshTokensRepository';
import UserDBInterface from './UserDBInterface';

export default class RefreshTokenDBInterface {
  private readonly refreshToken: RefreshToken;
  private readonly repository: RefreshTokensRepository;

  constructor(refreshToken: RefreshToken, repository: RefreshTokensRepository) {
    this.refreshToken = refreshToken;
    this.repository = repository;
  }

  public get tokenId(): string {
    return this.refreshToken.token;
  }

  public get expiresAt(): Date {
    return this.refreshToken.expiresAt;
  }

  public get createdAt(): Date {
    return this.refreshToken.createdAt;
  }

  public get activation(): string {
    return this.refreshToken.activation;
  }

  public hasExpired(): boolean {
    return this.refreshToken.hasExpired();
  }

  public async getUser(): Promise<UserDBInterface> {
    return this.repository.getUserOfRefreshToken(this.refreshToken);
  }
}
