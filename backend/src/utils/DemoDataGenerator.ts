import { delay, inject, singleton } from 'tsyringe';
import ResourceRepository from '../repositories/ResourceRepository';
import WeekdayRepository from '../repositories/WeekdayRepository';
import TimeslotRepository from '../repositories/TimeslotRepository';
import { checkType, TimeslotData } from 'common';
import SettingsRepository from '../repositories/SettingsRepository';

/**
 * Can generate database entries for a demo instance of the booking server
 */
@singleton()
export class DemoDataGenerator {
  constructor(
    @inject(delay(() => ResourceRepository))
    private readonly resourceRepository: ResourceRepository,

    @inject(delay(() => WeekdayRepository))
    private readonly weekdayRepository: WeekdayRepository,

    @inject(delay(() => TimeslotRepository))
    private readonly timeslotRepository: TimeslotRepository,

    @inject(delay(() => SettingsRepository))
    private readonly settingsRepository: SettingsRepository
  ) {}

  private async buildResource(name: string) {
    const existingResource = await this.resourceRepository.findByName(name);
    if (existingResource != null) {
      await existingResource.destroy();
    }

    const resource = await this.resourceRepository.create(name, {});
    const weekday = await this.weekdayRepository.create(resource, {
      name: 'sunday',
    });

    const hours: Array<number> = [10, 11, 12];
    for (const i of hours) {
      const timeslotData = checkType(
        {
          startHours: i,
          startMinutes: 0,
          endHours: i + 1,
          endMinutes: 0,
          capacity: 6,
        },
        TimeslotData
      );

      await this.timeslotRepository.create(weekday.id, timeslotData);
    }
  }

  public async genDemoData() {
    // We simulate resources of a hackerspace
    await this.buildResource('3D Printer');
    await this.buildResource('Electronics Lab');
    await this.buildResource('Workbench');

    // You can book only 2 weeks in advance
    const settings = await this.settingsRepository.get();
    const newSettings = settings.data;
    newSettings.maxBookingWeekDistance = 1;
    await this.settingsRepository.update(newSettings);
  }
}
