import React from 'react';
import '../App.css';
import { boundClass } from 'autobind-decorator';
import {
  createStyles,
  Divider,
  Paper,
  Popover,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { BookingGetInterface, NonEmptyString } from 'common';
import flow from 'lodash/fp/flow';
import groupBy from 'lodash/fp/groupBy';
import map from 'lodash/fp/map';
import sortBy from 'lodash/fp/sortBy';
import uniq from 'lodash/fp/uniq';
import { DateTime } from 'luxon';
import ColorHash from 'color-hash';
import { changeInteractionStateT } from '../App';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: '100%',
    },
    popoverTypography: {
      padding: theme.spacing(2),
    },
  });

@boundClass
class UnstyledResourceBookingsOverview extends React.PureComponent<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      popoverLocation: undefined,
    };
  }

  private groupBookings(
    bookings: readonly BookingGetInterface[]
  ): BookingsGroup[] {
    const groupedBookings = flow(
      groupBy((booking: BookingGetInterface) => [
        booking.startDate,
        booking.endDate,
      ]),
      map((bookingList: BookingGetInterface[]) => {
        const sampleBooking = bookingList[0];

        return {
          names: bookingList.map((booking) => booking.name),
          startDate: DateTime.fromISO(sampleBooking.startDate),
          endDate: DateTime.fromISO(sampleBooking.endDate),
          timeslotIds: flow(
            map((booking: BookingGetInterface) => booking.timeslotId),
            uniq
          )(bookingList),
        };
      }),
      sortBy((bookingGroup) => bookingGroup.startDate)
    )(bookings);

    return groupedBookings;
  }

  private handlePopoverOpen(event: React.MouseEvent<HTMLElement>) {
    this.setState({ popoverLocation: event.currentTarget });
  }

  private handlePopoverClose() {
    this.setState({ popoverLocation: undefined });
  }

  render() {
    const groupedBookings = this.groupBookings(this.props.bookings);

    const colorHash = new ColorHash({ lightness: 0.9, saturation: 1.0 });
    const color = colorHash.hex(this.props.resourceName);

    return (
      <div className={this.props.classes.container}>
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
                cursor:
                  bookingGroup.timeslotIds.length === 1 ? 'pointer' : 'auto',
              }}
              onClick={
                bookingGroup.timeslotIds.length === 1
                  ? () => {
                      this.props.changeInteractionState('viewingBookings', {
                        resourceName: this.props.resourceName,
                        timeslotId: bookingGroup.timeslotIds[0],
                        startTime: bookingGroup.startDate,
                        endTime: bookingGroup.endDate,
                        bookingDay: this.props.day,
                      });
                    }
                  : this.handlePopoverOpen
              }
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
        <Popover
          open={this.state.popoverLocation != null}
          onClose={this.handlePopoverClose}
          anchorEl={this.state.popoverLocation}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Typography className={this.props.classes.popoverTypography}>
            Mehrere Timeslots ??berlappen f??r diese Buchungen. Bitte w??hlen Sie
            den gew??nschten Timeslot zum editieren manuell ??ber das Hauptmen??.
          </Typography>
        </Popover>
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
  bookings: readonly BookingGetInterface[];
  day: DateTime;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  popoverLocation?: HTMLElement;
}

export interface BookingsGroup {
  names: NonEmptyString[];
  startDate: DateTime;
  endDate: DateTime;
  timeslotIds: number[];
}
