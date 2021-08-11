import {
  noRefinementChecks,
  ResourceData,
  ResourceGetInterface,
} from 'common/dist';
import { Resource } from '../../models/resource.model';
import ResourceRepository from '../ResourceRepository';
import { LazyGetter } from 'lazy-get-decorator';
import WeekdayDBInterface from './WeekdayDBInterface';
import { Settings } from '../../models/settings.model';
import SettingsRepository from '../SettingsRepository';
import {
  SettingsData,
  SettingsGetInterface,
} from 'common/dist/typechecking/api/Settings';

export default class SettingsDBInterface {
  private readonly settings: Settings;
  private readonly repository: SettingsRepository;

  constructor(settings: Settings, repository: SettingsRepository) {
    this.settings = settings;
    this.repository = repository;
  }

  @LazyGetter()
  public get data(): SettingsData {
    return noRefinementChecks<SettingsData>({
      bookingDeadlineMillis: this.settings.bookingDeadlineMillis,
    });
  }

  public async toGetInterface(): Promise<SettingsGetInterface> {
    return noRefinementChecks<SettingsGetInterface>(this.data);
  }
}
