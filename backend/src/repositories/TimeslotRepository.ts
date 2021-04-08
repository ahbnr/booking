import { Timeslot } from '../models/timeslot.model';
import { ResourcePostInterface, TimeslotPostInterface } from 'common/dist';
import { DestroyOptions, UpdateOptions } from 'sequelize';
import { Resource } from '../models/resource.model';
import { NoElementToDestroy, NoElementToUpdate } from './errors';

export default class TimeslotRepository {
  public async findAll(): Promise<Timeslot[]> {
    const timeslot = await Timeslot.findAll({});

    return timeslot;
  }

  public async findById(timeslotId: number): Promise<Timeslot | null> {
    const timeslot = await Timeslot.findByPk<Timeslot>(timeslotId);

    return timeslot;
  }

  public async update(timeslotId: number, timeslotData: TimeslotPostInterface) {
    const update: UpdateOptions = {
      where: { id: timeslotId },
      limit: 1,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [numAffectedRows, _] = await Timeslot.update(timeslotData, update);

    if (numAffectedRows < 1) {
      throw new NoElementToUpdate('timeslot');
    }
  }

  public async destroy(timeslotId: number) {
    const options: DestroyOptions = {
      where: { id: timeslotId },
      limit: 1,
    };

    const destroyedRows = await Timeslot.destroy(options);

    if (destroyedRows < 1) {
      throw new NoElementToDestroy('timeslot');
    }
  }
}
