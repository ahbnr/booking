import React, { ChangeEvent, Fragment } from 'react';
import '../App.css';
import { boundClass } from 'autobind-decorator';
import { Timeslot, TimeslotData } from '../models/Timeslot';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import { DateTime } from 'luxon';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DateType } from '@date-io/type';
import { Button, IconButton, TextField } from '@material-ui/core';
import { Client } from '../Client';
import {
  CreateBooking,
  InteractionState,
  ViewingBookings,
} from '../InteractionState';
import DeleteIcon from '@material-ui/icons/Delete';

@boundClass
class TimeslotView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      timeslot: undefined,
      startTime: undefined,
      endTime: undefined,
      capacity: 0,
      changed: false,
    };
  }

  async componentDidMount() {
    await this.refreshTimeslot();
  }

  async refreshTimeslot() {
    const timeslot = await Client.getTimeslot(this.props.timeslotId);

    this.setState({
      timeslot: timeslot,
      startTime: DateTime.fromObject({
        hour: timeslot.data.startHours,
        minute: timeslot.data.startMinutes,
      }),
      endTime: DateTime.fromObject({
        hour: timeslot.data.endHours,
        minute: timeslot.data.endMinutes,
      }),
      capacity: timeslot.data.capacity,
      capacityError: undefined,
      changed: false,
    });
  }

  async updateTimeslot(timeslotData: TimeslotData) {
    if (this.state.timeslot != null) {
      await Client.updateTimeslot(this.state.timeslot.id, timeslotData);

      await this.refreshTimeslot();
    }
  }

  onChangeStartTime(startTime: MaterialUiPickersDate) {
    this.setState({
      startTime: startTime || undefined,
      changed: true,
    });
  }

  onChangeEndTime(endTime: MaterialUiPickersDate) {
    this.setState({
      endTime: endTime || undefined,
      changed: true,
    });
  }

  onChangeCapacity(
    capacityChangeEvent: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const capacity = parseInt(capacityChangeEvent.target.value);

    if (capacity > 0) {
      this.setState({
        capacity: capacity,
        capacityError: undefined,
        changed: true,
      });
    } else {
      this.setState({
        capacityError: 'Muss Wert > 0 sein',
      });
    }
  }

  async setChangedTime() {
    if (this.state.startTime != null && this.state.endTime != null) {
      await this.updateTimeslot({
        startHours: this.state.startTime.hour,
        startMinutes: this.state.startTime.minute,
        endHours: this.state.endTime.hour,
        endMinutes: this.state.endTime.minute,
        capacity: this.state.capacity,
      });
    }
  }

  createBooking() {
    if (this.state.timeslot != null) {
      this.props.changeInteractionState(new CreateBooking(this.state.timeslot));
    }
  }

  async onDelete() {
    if (this.state.timeslot != null) {
      await Client.deleteTimeslot(this.state.timeslot.id);

      this.props.onDelete();
    }
  }

  viewBookings() {
    if (this.state.timeslot != null) {
      this.props.changeInteractionState(
        new ViewingBookings(this.state.timeslot)
      );
    }
  }

  render() {
    if (
      this.state.timeslot == null ||
      this.state.startTime == null ||
      this.state.endTime == null
    ) {
      return <>Timeslot not found in database</>;
    } else {
      return (
        <>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <Fragment>
              <TimePicker
                variant="inline"
                label="Startzeit"
                ampm={false}
                value={this.state.startTime}
                onChange={this.onChangeStartTime}
              />
              <TimePicker
                variant="inline"
                label="Endzeit"
                ampm={false}
                value={this.state.endTime}
                onChange={this.onChangeEndTime}
              />
              <TextField
                label="Kapazität"
                value={this.state.capacity}
                type="number"
                error={this.state.capacityError != null}
                helperText={this.state.capacityError}
                onChange={this.onChangeCapacity}
              />
              {this.state.changed && (
                <Button onClick={this.setChangedTime} color="primary">
                  Festlegen
                </Button>
              )}
              <Button onClick={this.viewBookings}>
                {this.state.timeslot.bookings.length} Buchungen
              </Button>
              <Button
                disabled={
                  this.state.timeslot.bookings.length >=
                  this.state.timeslot.data.capacity
                }
                onClick={this.createBooking}
              >
                {this.state.timeslot.bookings.length <
                this.state.timeslot.data.capacity
                  ? 'Buchen'
                  : 'Ausgebucht'}
              </Button>
              <IconButton onClick={this.onDelete}>
                <DeleteIcon />
              </IconButton>
            </Fragment>
          </MuiPickersUtilsProvider>
        </>
      );
    }
  }
}

interface Properties {
  timeslotId: number;
  changeInteractionState: (interactionState: InteractionState) => unknown;
  onDelete: () => unknown;
}

interface State {
  timeslot?: Timeslot;
  startTime?: DateType;
  endTime?: DateType;
  capacity: number;
  capacityError?: string;
  changed: boolean;
}

export default TimeslotView;
