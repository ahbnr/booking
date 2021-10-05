import { UniqueConstraintError } from 'sequelize';
import { DataIdAlreadyExists } from './errors';
import { boundClass } from 'autobind-decorator';
import { singleton } from 'tsyringe';
import { UnreliableMailDomain } from '../models/unreliablemaildomain.model';

@singleton()
@boundClass
export default class UnreliableMailDomainRepository {
  public async findAll(): Promise<string[]> {
    const unreliableDomains = await UnreliableMailDomain.findAll({
      include: [{ all: true }],
    });

    return unreliableDomains.map((entry) => entry.domain);
  }

  public async isMailDomainUnreliable(domain: string): Promise<boolean> {
    const entry = await UnreliableMailDomain.findByPk(domain);

    return entry != null && !entry.domain.trim().startsWith('#'); // Ignore commented out entries. Actually, this check is probably unnecessary since # is not a valid character for domains anyway
  }

  public async create(domains: readonly string[]) {
    try {
      await UnreliableMailDomain.bulkCreate(
        domains.map((domain) => ({ domain: domain }))
      );
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new DataIdAlreadyExists();
      }

      throw e;
    }
  }

  public async clear() {
    UnreliableMailDomain.destroy({ truncate: true });
  }
}
