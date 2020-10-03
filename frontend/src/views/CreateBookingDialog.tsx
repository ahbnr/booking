import React, { ChangeEvent } from 'react';
import { boundClass } from 'autobind-decorator';
import { Timeslot } from '../models/Timeslot';
import { Button, Paper, TextField } from '@material-ui/core';
import { Client } from '../Client';
import { InteractionState, ViewingTimeslots } from '../InteractionState';

@boundClass
export default class CreateBookingDialog extends React.Component<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      firstName: '',
      firstNameError: undefined,
      lastName: '',
      lastNameError: undefined,
    };
  }

  onFirstNameChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = changeEvent.target.value;

    this.setState({
      firstName: value,
      firstNameError: value.length > 0 ? undefined : 'Bitte ausfüllen',
    });
  }

  onLastNameChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = changeEvent.target.value;

    this.setState({
      lastName: value,
      lastNameError: value.length > 0 ? undefined : 'Bitte ausfüllen',
    });
  }

  canBeSubmitted(): boolean {
    return (
      this.state.firstName.length > 0 &&
      this.state.firstNameError == null &&
      this.state.lastName.length > 0 &&
      this.state.lastNameError == null
    );
  }

  async onSubmit() {
    await Client.createBooking(this.props.timeslot.id, {
      name: `${this.state.firstName} ${this.state.lastName}`,
    });

    this.props.changeInteractionState(
      new ViewingTimeslots(this.props.timeslot.weekday)
    );
  }

  render() {
    return (
      <>
        <Paper>
          <TextField
            required
            label={'Vorname'}
            value={this.state.firstName}
            error={this.state.firstNameError != null}
            helperText={this.state.firstNameError}
            onChange={this.onFirstNameChanged}
          />
          <TextField
            required
            label={'Nachname'}
            value={this.state.lastName}
            error={this.state.lastNameError != null}
            helperText={this.state.lastNameError}
            onChange={this.onLastNameChanged}
          />
          <Button disabled={!this.canBeSubmitted()} onClick={this.onSubmit}>
            Buchung absenden
          </Button>
        </Paper>
      </>
    );
  }
}

interface Properties {
  timeslot: Timeslot;
  changeInteractionState: (interactionState: InteractionState) => unknown;
}

interface State {
  firstName: string;
  firstNameError?: string;
  lastName: string;
  lastNameError?: string;
}
