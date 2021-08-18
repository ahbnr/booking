import React from 'react';
import '../App.css';
import { boundClass } from 'autobind-decorator';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import Skeleton from '@material-ui/lab/Skeleton';
import LuxonUtils from '@date-io/luxon';
import { DateTime } from 'luxon';
import { DateType } from '@date-io/type';
import {
  Chip,
  createStyles,
  Grid,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { Client } from '../Client';
import EditIcon from '@material-ui/icons/Edit';
import { TimeslotGetInterface } from 'common';
import { changeInteractionStateT } from '../App';
import noop from '../utils/noop';
import Suspense from './Suspense';

const styles = (theme: Theme) =>
  createStyles({
    skeletonStyle: {
      marginBottom: theme.spacing(1),
    },
    authSecondaryActionPadding: {
      paddingRight: 120,
    },
    unauthSecondaryActionPadding: {
      paddingRight: 76,
    },
    disabledAuthSecondaryActionPadding: {
      paddingRight: 120,
      '& .MuiTouchRipple-child': {
        backgroundColor: 'red',
      },
    },
    disabledUnauthSecondaryActionPadding: {
      paddingRight: 76,
      '& .MuiTouchRipple-child': {
        backgroundColor: 'red',
      },
    },
  });

@boundClass
class UnstyledTimeslotView extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      timeslotDisplayData: undefined,
    };
  }

  componentDidMount() {
    this.refreshTimeslot();
  }

  refreshTimeslot() {
    this.setState({
      timeslotDisplayData: this.fetchTimeslot(),
    });
  }

  async fetchTimeslot(): Promise<TimeslotDisplayData> {
    const timeslot = await this.props.client.getTimeslot(this.props.timeslotId);
    const numBookings = await this.props.client.countBookings(
      this.props.timeslotId,
      this.props.bookingDay
    );

    return {
      timeslot,
      startTime: DateTime.fromObject({
        hour: timeslot.startHours,
        minute: timeslot.startMinutes,
      }),
      endTime: DateTime.fromObject({
        hour: timeslot.endHours,
        minute: timeslot.endMinutes,
      }),
      numBookings,
    };
  }

  createBooking(
    timeslot: TimeslotGetInterface,
    startTime: DateTime,
    endTime: DateTime
  ) {
    this.props.changeInteractionState('createBooking', {
      resourceName: this.props.resourceName,
      timeslotId: timeslot.id,
      startTime,
      endTime,
      bookingDay: this.props.bookingDay,
    });
  }

  onEdit(timeslot: TimeslotGetInterface) {
    this.props.changeInteractionState('editingTimeslot', {
      timeslot: timeslot,
    });
  }

  viewBookings(
    timeslot: TimeslotGetInterface,

    startTime: DateTime,
    endTime: DateTime
  ) {
    this.props.changeInteractionState('viewingBookings', {
      resourceName: this.props.resourceName,
      timeslotId: timeslot.id,
      startTime,
      endTime,
      bookingDay: this.props.bookingDay,
    });
  }

  render() {
    return (
      <Suspense
        asyncAction={this.state.timeslotDisplayData}
        fallback={
          <Skeleton
            className={this.props.classes.skeletonStyle}
            variant="rect"
            width="100%"
            height={100}
          />
        }
        content={(displayData) => {
          const bookingsAvailable =
            displayData.numBookings < displayData.timeslot.capacity;

          const clickAction = this.props.isAuthenticated
            ? () =>
                this.viewBookings(
                  displayData.timeslot,
                  displayData.startTime,
                  displayData.endTime
                )
            : bookingsAvailable
            ? () =>
                this.createBooking(
                  displayData.timeslot,
                  displayData.startTime,
                  displayData.endTime
                )
            : undefined;

          return (
            <ListItem
              button
              onClick={clickAction}
              className={
                bookingsAvailable
                  ? this.props.isAuthenticated
                    ? this.props.classes.authSecondaryActionPadding
                    : this.props.classes.unauthSecondaryActionPadding
                  : this.props.isAuthenticated
                  ? this.props.classes.disabledAuthSecondaryActionPadding
                  : this.props.classes.disabledUnauthSecondaryActionPadding
              }
            >
              <ListItemText>
                <MuiPickersUtilsProvider utils={LuxonUtils}>
                  <Grid alignItems="center" container spacing={1}>
                    <Grid item xs={6}>
                      <TimePicker
                        variant="inline"
                        label="Startzeit"
                        disabled={!bookingsAvailable}
                        InputProps={{
                          readOnly: true,
                        }}
                        ampm={false}
                        value={displayData.startTime}
                        onChange={noop}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TimePicker
                        variant="inline"
                        label="Endzeit"
                        disabled={!bookingsAvailable}
                        InputProps={{
                          readOnly: true,
                        }}
                        ampm={false}
                        value={displayData.endTime}
                        onChange={noop}
                      />
                    </Grid>
                  </Grid>
                </MuiPickersUtilsProvider>
              </ListItemText>
              <ListItemSecondaryAction>
                <Chip
                  clickable
                  label={
                    this.props.isAuthenticated
                      ? `${displayData.numBookings}/${displayData.timeslot.capacity}`
                      : bookingsAvailable
                      ? 'Frei'
                      : 'Voll'
                  }
                  color={bookingsAvailable ? 'primary' : 'secondary'}
                  onClick={clickAction}
                />
                {this.props.isAuthenticated && (
                  <IconButton onClick={() => this.onEdit(displayData.timeslot)}>
                    <EditIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          );
        }}
      />
    );
  }
}

const TimeslotView = withStyles(styles)(UnstyledTimeslotView);
export default TimeslotView;

interface Properties extends WithStyles<typeof styles> {
  index: number;
  isAuthenticated: boolean;
  client: Client;
  resourceName: string;
  timeslotId: number;
  bookingDay: DateTime;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  timeslotDisplayData?: Promise<TimeslotDisplayData>;
}

interface TimeslotDisplayData {
  timeslot: TimeslotGetInterface;
  startTime: DateType;
  endTime: DateType;
  numBookings: number;
}
