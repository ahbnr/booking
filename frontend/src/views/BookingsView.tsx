import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { Client } from '../Client';
import BookingView from './BookingView';
import { BookingGetInterface, TimeslotGetInterface } from 'common';
import ListEx from './ListEx';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import Fab from '@material-ui/core/Fab';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { changeInteractionStateT } from '../App';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import { fabStyle } from '../styles/fab';
import { withTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
    },
    fab: fabStyle(theme),
  });

@boundClass
class UnstyledBookingsView extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      remoteData: undefined,
    };
  }

  componentDidMount() {
    this.refreshRemoteData();
  }

  createBooking(timeslot: TimeslotGetInterface, numBookings: number) {
    this.props.changeInteractionState('enteringName', {
      resourceName: this.props.resourceName,
      timeslotId: this.props.timeslotId,
      timeslotCapacity: timeslot.capacity,
      numBookingsForSlot: numBookings,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      bookingDay: this.props.bookingDay,
      isBookingGroup: false,
    });
  }

  async fetchRemoteData(): Promise<RemoteData> {
    const timeslot = await this.props.client.getTimeslot(this.props.timeslotId);

    const bookings = await this.props.client.getBookings(
      this.props.timeslotId,
      this.props.bookingDay
    );

    return {
      timeslot,
      bookings,
    };
  }

  refreshRemoteData() {
    this.setState({
      ...this.state,
      remoteData: this.fetchRemoteData(),
    });
  }

  render() {
    return (
      <Suspense
        asyncAction={this.state.remoteData}
        fallback={<LoadingScreen />}
        content={({ timeslot, bookings }) => (
          <div className={this.props.classes.container}>
            <ListEx
              emptyTitle="Keine Buchungen"
              emptyMessage="Dieser Zeitslot wurde noch nicht gebucht."
            >
              {bookings.map((booking) => (
                <BookingView
                  key={booking.id}
                  client={this.props.client}
                  bookingId={booking.id}
                  onDelete={this.refreshRemoteData}
                />
              ))}
            </ListEx>
            <Fab
              className={this.props.classes.fab}
              onClick={() => this.createBooking(timeslot, bookings.length)}
            >
              <PersonAddIcon />
            </Fab>
          </div>
        )}
      />
    );
  }
}

const BookingsView = withTranslation()(
  withStyles(styles)(UnstyledBookingsView)
);

export default BookingsView;

interface RemoteData {
  bookings: BookingGetInterface[];
  timeslot: TimeslotGetInterface;
}

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  resourceName: string;
  timeslotId: number;
  startTime: DateTime;
  endTime: DateTime;
  bookingDay: DateTime;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  remoteData?: Promise<RemoteData>;
}
