import React from 'react';
import '../App.css';
import { boundClass } from 'autobind-decorator';
import {
  createStyles,
  Divider,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { BookingWithContextGetInterface, NonEmptyString } from 'common';
import _ from 'lodash';
import { DateTime } from 'luxon';
import ColorHash from 'color-hash';

const styles = (theme: Theme) => createStyles({});

@boundClass
class UnstyledResourceBookingsOverview extends React.Component<
  Properties,
  State
> {
  private groupBookings(
    bookings: BookingWithContextGetInterface[]
  ): BookingsGroup[] {
    const groupedBookings: BookingsGroup[] = _.chain(bookings)
      .groupBy((booking) => [booking.startDate, booking.endDate])
      .map((bookingList) => {
        const sampleBooking = bookingList[0];

        return {
          names: bookingList.map((booking) => booking.name),
          startDate: DateTime.fromISO(sampleBooking.startDate),
          endDate: DateTime.fromISO(sampleBooking.endDate),
        };
      })
      .sortBy((bookingGroup) => bookingGroup.startDate)
      .value();

    return groupedBookings;
  }

  render() {
    const groupedBookings = this.groupBookings(this.props.bookings);

    const colorHash = new ColorHash({ lightness: 0.9, saturation: 1.0 });
    const color = colorHash.hex(this.props.resourceName);

    return (
      <div style={{ width: '100%' }}>
        <Typography
          component="h5"
          variant="h5"
          align="center"
          style={{ marginBottom: '1ex' }}
        >
          {this.props.resourceName}
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {groupedBookings.map((bookingGroup) => (
            <Paper
              key={bookingGroup.startDate.toISO()}
              style={{
                display: 'flex',
                marginBottom: '1.5ex',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px 16px 16px 16px',
                }}
              >
                {bookingGroup.startDate.toLocaleString({
                  ...DateTime.TIME_24_SIMPLE,
                  locale: 'de-DE',
                })}
                <br />
                {' - '}
                <br />
                {bookingGroup.endDate.toLocaleString({
                  ...DateTime.TIME_24_SIMPLE,
                  locale: 'de-DE',
                })}
              </div>
              <Divider orientation="vertical" flexItem />
              <div
                style={{
                  flexGrow: 1,
                  padding: '16px 16px 16px 16px',
                  backgroundColor: color,
                  borderRadius: '0px 4px 4px 0px',
                }}
              >
                {bookingGroup.names.join(', ')}
              </div>
            </Paper>
          ))}
        </div>
      </div>
    );
  }
}

const ResourceBookingsOverview = withStyles(styles)(
  UnstyledResourceBookingsOverview
);
export default ResourceBookingsOverview;

interface Properties extends WithStyles<typeof styles> {
  resourceName: NonEmptyString;
  bookings: BookingWithContextGetInterface[];
}

interface State {}

export interface BookingsGroup {
  names: NonEmptyString[];
  startDate: DateTime;
  endDate: DateTime;
}
