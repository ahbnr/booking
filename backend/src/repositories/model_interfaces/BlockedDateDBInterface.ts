import { noRefinementChecks } from 'common/dist';
import { BlockedDate } from '../../models/blockeddate.model';
import BlockedDateRepository from '../BlockedDateRepository';
import { BlockedDateGetInterface } from 'common';
import { DateTime } from 'luxon';

export default class BlockedDateDBInterface {
  private readonly blockedDate: BlockedDate;
  private readonly repository: BlockedDateRepository;

  constructor(blockedDate: BlockedDate, repository: BlockedDateRepository) {
    this.blockedDate = blockedDate;
    this.repository = repository;
  }

  public get date(): DateTime {
    return DateTime.fromJSDate(this.blockedDate.date);
  }

  public get note(): string | undefined {
    return this.blockedDate.note || undefined;
  }

  public toGetInterface(): BlockedDateGetInterface {
    return noRefinementChecks<BlockedDateGetInterface>({
      date: this.blockedDate.date.toISOString(),
      note: this.blockedDate.note || undefined,
    });
  }
}
