import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { Client } from '../Client';
import BookingView from './BookingView';
import { BookingGetInterface } from 'common/dist';
import ListEx from './ListEx';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';

@boundClass
export default class BookingsView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      bookings: undefined,
    };
  }

  componentDidMount() {
    this.refreshBookings();
  }

  refreshBookings() {
    const bookingsPromise = this.props.client.getBookings(
      this.props.timeslotId
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
          </>
        )}
      />
    );
  }
}

interface Properties {
  client: Client;
  timeslotId: number;
}

interface State {
  bookings?: Promise<BookingGetInterface[]>;
}
