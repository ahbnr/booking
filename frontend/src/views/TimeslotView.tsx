import React, { ChangeEvent, Fragment } from 'react';
import '../App.css';
import { boundClass } from 'autobind-decorator';
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
import {
  noRefinementChecks,
  TimeslotGetInterface,
  TimeslotPostInterface,
} from 'common/dist';
import { changeInteractionStateT } from '../App';

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
    const timeslot = await this.props.client.getTimeslot(this.props.timeslotId);

    this.setState({
      timeslot: timeslot,
      startTime: DateTime.fromObject({
        hour: timeslot.startHours,
        minute: timeslot.startMinutes,
      }),
      endTime: DateTime.fromObject({
        hour: timeslot.endHours,
        minute: timeslot.endMinutes,
      }),
      capacity: timeslot.capacity,
      capacityError: undefined,
      changed: false,
    });
  }

  async updateTimeslot(timeslotData: TimeslotPostInterface) {
    if (this.state.timeslot != null) {
      await this.props.client.updateTimeslot(
        this.state.timeslot.id,
        timeslotData
      );

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
      await this.updateTimeslot(
        // We don't check the refinement types here. The server will perform checks anyway
        noRefinementChecks<TimeslotPostInterface>({
          startHours: this.state.startTime.hour,
          startMinutes: this.state.startTime.minute,
          endHours: this.state.endTime.hour,
          endMinutes: this.state.endTime.minute,
          capacity: this.state.capacity,
        })
      );
    }
  }

  createBooking() {
    if (this.state.timeslot != null) {
      this.props.changeInteractionState('createBooking', {
        timeslot: this.state.timeslot,
      });
    }
  }

  async onDelete() {
    if (this.state.timeslot != null) {
      await this.props.client.deleteTimeslot(this.state.timeslot.id);

      this.props.onDelete();
    }
  }

  viewBookings() {
    if (this.state.timeslot != null) {
      this.props.changeInteractionState('viewingBookings', {
        timeslot: this.state.timeslot,
      });
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
                InputProps={{
                  readOnly: !this.props.isAuthenticated,
                }}
                ampm={false}
                value={this.state.startTime}
                onChange={this.onChangeStartTime}
              />
              <TimePicker
                variant="inline"
                label="Endzeit"
                InputProps={{
                  readOnly: !this.props.isAuthenticated,
                }}
                ampm={false}
                value={this.state.endTime}
                onChange={this.onChangeEndTime}
              />
              <TextField
                label="Kapazität"
                value={this.state.capacity}
                type="number"
                InputProps={{
                  readOnly: !this.props.isAuthenticated,
                }}
                error={this.state.capacityError != null}
                helperText={this.state.capacityError}
                onChange={this.onChangeCapacity}
              />
              {this.state.changed && this.props.isAuthenticated && (
                <Button onClick={this.setChangedTime} color="primary">
                  Festlegen
                </Button>
              )}
              {this.props.isAuthenticated && (
                <Button onClick={this.viewBookings}>
                  {this.state.timeslot.bookingIds.length} Buchungen
                </Button>
              )}
              <Button
                disabled={
                  this.state.timeslot.bookingIds.length >=
                  this.state.timeslot.capacity
                }
                onClick={this.createBooking}
              >
                {this.state.timeslot.bookingIds.length <
                this.state.timeslot.capacity
                  ? 'Buchen'
                  : 'Ausgebucht'}
              </Button>
              {this.props.isAuthenticated && (
                <IconButton onClick={this.onDelete}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Fragment>
          </MuiPickersUtilsProvider>
        </>
      );
    }
  }
}

interface Properties {
  isAuthenticated: boolean;
  client: Client;
  timeslotId: number;
  changeInteractionState: changeInteractionStateT;
  onDelete: () => unknown;
}

interface State {
  timeslot?: TimeslotGetInterface;
  startTime?: DateType;
  endTime?: DateType;
  capacity: number;
  capacityError?: string;
  changed: boolean;
}

export default TimeslotView;
