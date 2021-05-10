import { RefreshToken } from '../../models/refreshtoken.model';
import RefreshTokensRepository from '../RefreshTokensRepository';
import UserDBInterface from './UserDBInterface';
import { DateTime } from 'luxon';

export default class RefreshTokenDBInterface {
  private readonly refreshToken: RefreshToken;
  private readonly repository: RefreshTokensRepository;

  constructor(refreshToken: RefreshToken, repository: RefreshTokensRepository) {
    this.refreshToken = refreshToken;
    this.repository = repository;
  }

  public get expiresAt(): Date {
    return this.refreshToken.expiresAt;
  }

  public hasExpired(): boolean {
    return this.refreshToken.hasExpired();
  }

  public async getUser(): Promise<UserDBInterface> {
    return this.repository.getUserOfRefreshToken(this.refreshToken);
  }
}
