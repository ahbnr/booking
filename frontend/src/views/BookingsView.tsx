import React from 'react';
import '../App.css';
import { ListGroup } from 'react-bootstrap';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { Client } from '../Client';
import BookingView from './BookingView';
import { BookingGetInterface } from 'common/dist';

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
      <div className="TimeslotsView">
        <ListGroup className="Listing">
          {this.state.bookings.map((booking) => (
            <ListGroup.Item key={booking.id}>
              <BookingView
                client={this.props.client}
                bookingId={booking.id}
                onDelete={this.refreshBookings}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
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
