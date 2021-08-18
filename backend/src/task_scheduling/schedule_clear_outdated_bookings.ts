import schedule from 'node-schedule';
import { container } from 'tsyringe';
import BookingRepository from '../repositories/BookingRepository';

export default function schedule_clear_outdated_bookings() {
  schedule.scheduleJob('00 01 * * *', async function () {
    console.log('Scheduled clearing of outdated bookings started.');
    const bookingRepository = container.resolve(BookingRepository);

    await bookingRepository.clearAllOutdatedBookings();
  });
}
