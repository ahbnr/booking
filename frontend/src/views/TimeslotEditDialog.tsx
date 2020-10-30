import React, { ChangeEvent, Fragment } from 'react';
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
} from 'common/dist';
import { changeInteractionStateT } from '../App';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import { DateType } from '@date-io/type';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DateTime } from 'luxon';
import LoadingBackdrop from './LoadingBackdrop';
import DeleteConfirmer from './DeleteConfirmer';

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

    this.state = {
      startTime: DateTime.fromObject({
        hour: props.timeslot.startHours,
        minute: props.timeslot.startMinutes,
      }),

      endTime: DateTime.fromObject({
        hour: props.timeslot.endHours,
        minute: props.timeslot.endMinutes,
      }),

      capacity: props.timeslot.capacity,

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
      await this.props.client.updateTimeslot(this.props.timeslot.id, postData);

      window.history.back();
    }
  }

  async onDelete() {
    this.setState({
      backdropOpen: true,
    });
    await this.props.client.deleteTimeslot(this.props.timeslot.id);

    window.history.back();
  }

  onChangeStartTime(startTime: MaterialUiPickersDate) {
    if (startTime != null) {
      this.setState({
        startTime: startTime,
      });
    }
  }

  onChangeEndTime(endTime: MaterialUiPickersDate) {
    if (endTime != null) {
      this.setState({
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
              Anpassung eines Buchungsslots
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
                  Ändern
                </Button>
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
  timeslot: TimeslotGetInterface;
}

interface State {
  startTime: DateType;
  endTime: DateType;
  capacity: number;
  capacityError?: string;
  backdropOpen: boolean;
}
