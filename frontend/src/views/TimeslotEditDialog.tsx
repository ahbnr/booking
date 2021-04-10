import React, { ChangeEvent } from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Container,
  createStyles,
  CssBaseline,
  TextField,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import TimelapseIcon from '@material-ui/icons/Timelapse';
import { Client } from '../Client';
import {
  noRefinementChecks,
  TimeslotGetInterface,
  TimeslotPostInterface,
  WeekdayGetInterface,
} from 'common/dist';
import { changeInteractionStateT } from '../App';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import { DateType } from '@date-io/type';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DateTime } from 'luxon';
import LoadingBackdrop from './LoadingBackdrop';
import DeleteConfirmer from './DeleteConfirmer';
import { ADT, matchI } from 'ts-adt';
import { is } from '../utils/constructAdt';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  });

@boundClass
class UnstyledTimeslotEditDialog extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    const inputInit = matchI(this.props.mode)({
      editMode: ({ timeslot }) => ({
        startTime: DateTime.fromObject({
          hour: timeslot.startHours,
          minute: timeslot.startMinutes,
        }),

        endTime: DateTime.fromObject({
          hour: timeslot.endHours,
          minute: timeslot.endMinutes,
        }),

        capacity: timeslot.capacity,
      }),
      createMode: (_) => ({
        startTime: DateTime.fromObject({
          hour: 0,
          minute: 0,
        }),

        endTime: DateTime.fromObject({
          hour: 0,
          minute: 0,
        }),

        capacity: 1,
      }),
    });

    this.state = {
      ...inputInit,
      backdropOpen: false,
    };
  }

  canBeSubmitted(): boolean {
    return this.state.capacity > 0 && this.state.capacityError == null;
  }

  async onSubmit() {
    if (this.canBeSubmitted()) {
      const postData = noRefinementChecks<TimeslotPostInterface>({
        startHours: this.state.startTime.hour,
        startMinutes: this.state.startTime.minute,
        endHours: this.state.endTime.hour,
        endMinutes: this.state.endTime.minute,
        capacity: this.state.capacity,
      });

      this.setState({
        backdropOpen: true,
      });

      await matchI(this.props.mode)({
        editMode: ({ timeslot }) =>
          this.props.client.updateTimeslot(timeslot.id, postData),
        createMode: ({ weekday }) =>
          this.props.client.createTimeslot(weekday.id, postData),
      });

      window.history.back();
    }
  }

  async onDelete() {
    if (is(this.props.mode, 'editMode')) {
      this.setState({
        backdropOpen: true,
      });
      await this.props.client.deleteTimeslot(this.props.mode.timeslot.id);

      window.history.back();
    }
  }

  onChangeStartTime(startTime: MaterialUiPickersDate) {
    if (startTime != null) {
      this.setState({
        startTime: startTime,
        endTime:
          startTime >= this.state.endTime ? startTime : this.state.endTime,
      });
    }
  }

  onChangeEndTime(endTime: MaterialUiPickersDate) {
    if (endTime != null) {
      this.setState({
        startTime:
          endTime <= this.state.startTime ? endTime : this.state.startTime,
        endTime: endTime,
      });
    }
  }

  onCapacityChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = parseInt(changeEvent.target.value);

    this.setState({
      capacity: value,
      capacityError: value > 0 ? undefined : 'Wert größer 0 erforderlich',
    });
  }

  render() {
    return (
      <>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={this.props.classes.paper}>
            <Avatar className={this.props.classes.avatar}>
              <TimelapseIcon />
            </Avatar>
            <Typography component="h1" variant="h5" align="center">
              {matchI(this.props.mode)({
                editMode: () => 'Anpassung eines Buchungsslots',
                createMode: () => 'Erstellung eines Buchungsslots',
              })}
            </Typography>
            <MuiPickersUtilsProvider utils={LuxonUtils}>
              <form className={this.props.classes.form} noValidate>
                <TimePicker
                  required
                  inputVariant="outlined"
                  margin="normal"
                  fullWidth
                  label="Startzeit"
                  autoFocus
                  ampm={false}
                  value={this.state.startTime}
                  onChange={this.onChangeStartTime}
                />
                <TimePicker
                  required
                  inputVariant="outlined"
                  margin="normal"
                  fullWidth
                  label="Endzeit"
                  ampm={false}
                  value={this.state.endTime}
                  onChange={this.onChangeEndTime}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label={'Kapazität'}
                  type="number"
                  value={this.state.capacity}
                  error={this.state.capacityError != null}
                  helperText={this.state.capacityError}
                  onChange={this.onCapacityChanged}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  className={this.props.classes.submit}
                  disabled={!this.canBeSubmitted()}
                  onClick={this.onSubmit}
                >
                  {matchI(this.props.mode)({
                    editMode: () => 'Ändern',
                    createMode: () => 'Erstellen',
                  })}
                </Button>
                {is(this.props.mode, 'editMode') && (
                  <DeleteConfirmer name={'der Timeslot'}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={this.onDelete}
                    >
                      Löschen
                    </Button>
                  </DeleteConfirmer>
                )}
              </form>
            </MuiPickersUtilsProvider>
          </div>
        </Container>
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const TimeslotEditDialog = withStyles(styles)(UnstyledTimeslotEditDialog);
export default TimeslotEditDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  changeInteractionState: changeInteractionStateT;
  mode: Mode;
}

interface State {
  startTime: DateType;
  endTime: DateType;
  capacity: number;
  capacityError?: string;
  backdropOpen: boolean;
}

export type Mode = ADT<{
  editMode: {
    timeslot: TimeslotGetInterface;
  };
  createMode: {
    weekday: WeekdayGetInterface;
  };
}>;
