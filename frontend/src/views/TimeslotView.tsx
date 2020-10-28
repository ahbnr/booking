import React, { ChangeEvent, Fragment } from 'react';
import '../App.css';
import { boundClass } from 'autobind-decorator';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import { DateTime } from 'luxon';
import { DateType } from '@date-io/type';
import {
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { Client } from '../Client';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { TimeslotGetInterface, TimeslotPostInterface } from 'common/dist';
import { changeInteractionStateT } from '../App';
import noop from '../utils/noop';

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

  onEdit() {
    if (this.state.timeslot != null) {
      this.props.changeInteractionState('editingTimeslot', {
        timeslot: this.state.timeslot,
      });
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
      const bookingsAvailable =
        this.state.timeslot.bookingIds.length < this.state.timeslot.capacity;

      return (
        <ListItem
          button
          disabled={
            !this.props.isAuthenticated &&
            this.state.timeslot.bookingIds.length >=
              this.state.timeslot.capacity
          }
          onClick={this.createBooking}
        >
          <ListItemText>
            <MuiPickersUtilsProvider utils={LuxonUtils}>
              <Grid alignItems="center" container spacing={3}>
                <Grid item xs={1}>
                  <Typography variant="h6">#{this.props.index + 1}</Typography>
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Grid item xs={5}>
                  <TimePicker
                    variant="inline"
                    label="Startzeit"
                    InputProps={{
                      readOnly: true,
                    }}
                    ampm={false}
                    value={this.state.startTime}
                    onChange={noop}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TimePicker
                    variant="inline"
                    label="Endzeit"
                    InputProps={{
                      readOnly: true,
                    }}
                    ampm={false}
                    value={this.state.endTime}
                    onChange={noop}
                  />
                </Grid>
              </Grid>
            </MuiPickersUtilsProvider>
          </ListItemText>
          <ListItemSecondaryAction>
            {!this.props.isAuthenticated && (
              <Chip
                clickable
                label={bookingsAvailable ? 'Frei' : 'Ausgebucht'}
                color={bookingsAvailable ? 'primary' : 'secondary'}
                onClick={bookingsAvailable ? this.createBooking : undefined}
              />
            )}
            {this.props.isAuthenticated && (
              <>
                <Button
                  variant="outlined"
                  onClick={this.viewBookings}
                  color={bookingsAvailable ? 'primary' : 'secondary'}
                >
                  {this.state.timeslot.bookingIds.length}/
                  {this.state.timeslot.capacity} Buchungen
                </Button>
                <IconButton onClick={this.onEdit}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={this.onDelete}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      );
    }
  }
}

interface Properties {
  index: number;
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
