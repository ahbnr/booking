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
} from '@material-ui/core';
import { Client } from '../Client';
import withStyles from '@material-ui/core/styles/withStyles';
import TimelapseIcon from '@material-ui/icons/Timelapse';
import { EMailString, NonEmptyString, TimeslotGetInterface } from 'common/dist';
import getBaseUrl from '../utils/getBaseUrl';
import { changeInteractionStateT } from '../App';
import LoadingBackdrop from './LoadingBackdrop';

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
class UnstyledCreateBookingDialog extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      firstName: '',
      firstNameError: undefined,
      lastName: '',
      lastNameError: undefined,
      email: '',
      emailError: undefined,
      backdropOpen: false,
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

  onEmailChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = changeEvent.target.value;

    this.setState({
      email: value,
      emailError:
        value.length > 0 ? undefined : 'Bitte gültige E-Mail eintragen',
    });
  }

  canBeSubmitted(): boolean {
    return (
      this.state.firstName.length > 0 &&
      this.state.firstNameError == null &&
      this.state.lastName.length > 0 &&
      this.state.lastNameError == null &&
      this.state.email.length > 0 &&
      this.state.emailError == null
    );
  }

  async onSubmit() {
    this.setState({
      backdropOpen: true,
    });
    await this.props.client.createBooking(this.props.timeslot.id, {
      name: `${this.state.firstName} ${this.state.lastName}` as NonEmptyString,
      email: this.state.email as EMailString,
      lookupUrl: `${getBaseUrl()}/`,
    });

    const weekday = await this.props.client.getWeekday(
      this.props.timeslot.weekdayId
    );

    this.props.changeInteractionState('confirmingBookingDialog', {});
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
            <Typography component="h1" variant="h5">
              Buchung
            </Typography>
            <form className={this.props.classes.form} noValidate>
              <TextField
                required
                variant="outlined"
                margin="normal"
                fullWidth
                autoFocus
                label={'Vorname'}
                value={this.state.firstName}
                error={this.state.firstNameError != null}
                helperText={this.state.firstNameError}
                onChange={this.onFirstNameChanged}
              />
              <TextField
                required
                variant="outlined"
                margin="normal"
                fullWidth
                label={'Nachname'}
                value={this.state.lastName}
                error={this.state.lastNameError != null}
                helperText={this.state.lastNameError}
                onChange={this.onLastNameChanged}
              />
              <TextField
                required
                variant="outlined"
                margin="normal"
                fullWidth
                label={'E-Mail'}
                autoComplete="email"
                value={this.state.email}
                error={this.state.emailError != null}
                helperText={this.state.emailError}
                onChange={this.onEmailChanged}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={this.props.classes.submit}
                disabled={!this.canBeSubmitted()}
                onClick={this.onSubmit}
              >
                Buchung absenden
              </Button>
            </form>
          </div>
        </Container>
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const CreateBookingDialog = withStyles(styles)(UnstyledCreateBookingDialog);
export default CreateBookingDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  timeslot: TimeslotGetInterface;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  firstName: string;
  firstNameError?: string;
  lastName: string;
  lastNameError?: string;
  email: string;
  emailError?: string;
  backdropOpen: boolean;
}
