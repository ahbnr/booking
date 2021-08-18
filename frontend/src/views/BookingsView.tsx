import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { Client } from '../Client';
import BookingView from './BookingView';
import { BookingGetInterface } from 'common';
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
    fab: fabStyle(theme),
  });

@boundClass
class UnstyledBookingsView extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      bookings: undefined,
    };
  }

  componentDidMount() {
    this.refreshBookings();
  }

  createBooking() {
    this.props.changeInteractionState('createBooking', {
      resourceName: this.props.resourceName,
      timeslotId: this.props.timeslotId,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      bookingDay: this.props.bookingDay,
    });
  }

  refreshBookings() {
    const bookingsPromise = this.props.client.getBookings(
      this.props.timeslotId,
      this.props.bookingDay
    );

    this.setState({
      ...this.state,
      bookings: bookingsPromise,
    });
  }

  render() {
    return (
      <Suspense
        asyncAction={this.state.bookings}
        fallback={<LoadingScreen />}
        content={(bookings) => (
          <>
            <ListEx
              emptyTitle="Keine Buchungen"
              emptyMessage="Dieser Zeitslot wurde noch nicht gebucht."
            >
              {bookings.map((booking) => (
                <BookingView
                  key={booking.id}
                  client={this.props.client}
                  bookingId={booking.id}
                  onDelete={this.refreshBookings}
                />
              ))}
            </ListEx>
            <Fab
              className={this.props.classes.fab}
              onClick={this.createBooking}
            >
              <PersonAddIcon />
            </Fab>
          </>
        )}
      />
    );
  }
}

const BookingsView = withTranslation()(
  withStyles(styles)(UnstyledBookingsView)
);

export default BookingsView;

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
  bookings?: Promise<BookingGetInterface[]>;
}
