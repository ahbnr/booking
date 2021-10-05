import { Response } from 'express';
import { MissingPathParameter } from './errors';
import { boundClass } from 'autobind-decorator';
import { checkType, hasProperty } from 'common/dist';
import TypesafeRequest from './TypesafeRequest';
import { delay, inject, singleton } from 'tsyringe';
import UnreliableMailDomainRepository from '../repositories/UnreliableMailDomainRepository';
import { SetUnreliableMailDomainsRequest } from 'common';

@singleton()
@boundClass
export class UnreliableMailDomainsController {
  constructor(
    @inject(delay(() => UnreliableMailDomainRepository))
    private readonly unreliableMailDomainRepository: UnreliableMailDomainRepository
  ) {}

  public async index(req: TypesafeRequest, res: Response<readonly string[]>) {
    const domains = await this.unreliableMailDomainRepository.findAll();

    res.json(domains);
  }

  public async isMailDomainUnreliable(
    req: TypesafeRequest,
    res: Response<boolean>
  ) {
    const domain = UnreliableMailDomainsController.domainFromRoute(req);

    const isItUnreliable = await this.unreliableMailDomainRepository.isMailDomainUnreliable(
      domain
    );

    res.json(isItUnreliable);
  }

  public async set(req: TypesafeRequest, res: Response) {
    const domains = checkType(req.body, SetUnreliableMailDomainsRequest);

    await this.unreliableMailDomainRepository.clear();
    await this.unreliableMailDomainRepository.create(domains);

    res.status(201).json();
  }

  private static domainFromRoute(req: TypesafeRequest): string {
    if (
      hasProperty(req.params, 'domain') &&
      typeof req.params.domain === 'string'
    ) {
      return req.params.domain;
    } else {
      throw new MissingPathParameter('domain');
    }
  }
}
