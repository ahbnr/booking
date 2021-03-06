import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Container,
  createStyles,
  TextField,
  Theme,
  Typography,
  WithStyles,
} from '@material-ui/core';
import { Client } from '../Client';
import withStyles from '@material-ui/core/styles/withStyles';
import FaceIcon from '@material-ui/icons/Face';
import { changeInteractionStateT } from '../App';
import { DateTime } from 'luxon';
import { Controller, useForm } from 'react-hook-form';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { WithTranslation, withTranslation } from 'react-i18next';
import { NonEmptyString } from 'common';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    subtitle: {
      paddingTop: theme.spacing(1),
      textAlign: 'center',
    },
  });

@boundClass
class UnstyledEnterNameDialog extends React.PureComponent<Properties, State> {
  async onSubmit(formInput: IFormInput) {
    const name = `${formInput.firstName.trim()} ${formInput.lastName.trim()}` as NonEmptyString;

    if (this.props.isBookingGroup) {
      this.props.changeInteractionState('addingParticipant', {
        resourceName: this.props.resourceName,
        timeslotId: this.props.timeslotId,
        timeslotCapacity: this.props.timeslotCapacity,
        numBookingsForSlot: this.props.numBookingsForSlot,
        startTime: this.props.startTime,
        endTime: this.props.endTime,
        bookingDay: this.props.bookingDay,
        participantNames: [name],
      });
    } else {
      this.props.changeInteractionState('enteringEmail', {
        resourceName: this.props.resourceName,
        timeslotId: this.props.timeslotId,
        timeslotCapacity: this.props.timeslotCapacity,
        numBookingsForSlot: this.props.numBookingsForSlot,
        startTime: this.props.startTime,
        endTime: this.props.endTime,
        bookingDay: this.props.bookingDay,
        participantNames: [name],
      });
    }
  }

  render() {
    return (
      <>
        <Container
          className={this.props.classes.container}
          component="main"
          maxWidth="xs"
        >
          <div className={this.props.classes.paper}>
            <Avatar className={this.props.classes.avatar}>
              <FaceIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Ihr Name
            </Typography>
            <Typography
              className={this.props.classes.subtitle}
              variant="subtitle1"
            >
              {this.props.isBookingGroup ? (
                <>
                  Bitte geben Sie hier Ihren eigenen Namen an.
                  <br />
                  Sie k??nnen die Namen der anderen Gruppenmitglieder sp??ter
                  angeben.
                </>
              ) : (
                <>Bitte geben Sie Ihren Namen an:</>
              )}
            </Typography>
            <NameForm onSubmit={this.onSubmit} />
          </div>
        </Container>
      </>
    );
  }
}

interface SettingsFormProps {
  onSubmit: (formInput: IFormInput) => unknown;
}

const useFormStyles = makeStyles((theme) => ({
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function NameForm(props: SettingsFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IFormInput>();
  const classes = useFormStyles();

  return (
    <form className={classes.form} onSubmit={handleSubmit(props.onSubmit)}>
      <Controller
        name={'firstName'}
        control={control}
        rules={{
          required: true,
          maxLength: { value: 64, message: 'Der Name ist zu lang!' },
        }}
        render={({ field }) => (
          <TextField
            required
            variant="outlined"
            margin="normal"
            fullWidth
            autoFocus
            label={'Vorname'}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            {...field}
          />
        )}
      />
      <Controller
        name={'lastName'}
        control={control}
        rules={{
          required: true,
          maxLength: { value: 64, message: 'Der Name ist zu lang!' },
        }}
        render={({ field }) => (
          <TextField
            required
            variant="outlined"
            margin="normal"
            fullWidth
            label={'Nachname'}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            {...field}
          />
        )}
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        type="submit"
        className={classes.submit}
      >
        {`OK`}
      </Button>
    </form>
  );
}

const EnterNameDialog = withTranslation()(
  withStyles(styles)(UnstyledEnterNameDialog)
);
export default EnterNameDialog;

interface IFormInput {
  firstName: string;
  lastName: string;
}

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  client: Client;
  resourceName: string;
  timeslotId: number;
  timeslotCapacity: number;
  numBookingsForSlot: number;
  startTime: DateTime;
  endTime: DateTime;
  bookingDay: DateTime;
  changeInteractionState: changeInteractionStateT;
  isAuthenticated: boolean;
  isBookingGroup: boolean;
}

interface State {
  backdropOpen: boolean;
}
