import React, { Fragment } from 'react';
import '../App.css';
import { boundClass } from 'autobind-decorator';
import { IconButton, TextField } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { Client } from '../Client';
import { Booking } from '../models/Booking';

@boundClass
export default class BookingView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      booking: undefined,
    };
  }

  async componentDidMount() {
    await this.refreshBooking();
  }

  async refreshBooking() {
    const booking = await this.props.client.getBooking(this.props.bookingId);

    this.setState({
      booking: booking,
    });
  }

  async onDelete() {
    if (this.state.booking != null) {
      await this.props.client.deleteBooking(this.state.booking.id);

      this.props.onDelete();
    }
  }

  render() {
    if (this.state.booking == null) {
      return <>Buchung nicht gefunden</>;
    } else {
      return (
        <>
          <Fragment>
            <TextField
              label="Name"
              value={this.state.booking.data.name}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="E-Mail"
              value={this.state.booking.data.email}
              InputProps={{
                readOnly: true,
              }}
            />
            <IconButton onClick={this.onDelete}>
              <DeleteIcon />
            </IconButton>
          </Fragment>
        </>
      );
    }
  }
}

interface Properties {
  client: Client;
  bookingId: number;
  onDelete: () => unknown;
}

interface State {
  booking?: Booking;
}
