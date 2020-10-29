import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { Client } from '../Client';
import BookingView from './BookingView';
import { BookingGetInterface } from 'common/dist';
import { List } from '@material-ui/core';

@boundClass
export default class BookingsView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      bookings: [],
    };
  }

  async componentDidMount() {
    await this.refreshBookings();
  }

  async refreshBookings() {
    const bookings = await this.props.client.getBookings(this.props.timeslotId);

    this.setState({
      ...this.state,
      bookings: bookings,
    });
  }

  render() {
    return (
      <>
        <List component="nav">
          {this.state.bookings.map((booking) => (
            <BookingView
              key={booking.id}
              client={this.props.client}
              bookingId={booking.id}
              onDelete={this.refreshBookings}
            />
          ))}
        </List>
      </>
    );
  }
}

interface Properties {
  client: Client;
  timeslotId: number;
}

interface State {
  bookings: BookingGetInterface[];
}
