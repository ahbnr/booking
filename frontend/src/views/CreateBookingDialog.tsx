import React from 'react';
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
import getBaseUrl from '../utils/getBaseUrl';
import { changeInteractionStateT } from '../App';
import LoadingBackdrop from './LoadingBackdrop';
import { DateTime } from 'luxon';
import {
  ISO8601,
  NonEmptyString,
  BookingData,
  noRefinementChecks,
} from 'common';
import { Controller, useForm } from 'react-hook-form';
import makeStyles from '@material-ui/core/styles/makeStyles';

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
    subtitle: {
      paddingTop: theme.spacing(1),
      textAlign: 'center',
    },
  });

@boundClass
class UnstyledCreateBookingDialog extends React.PureComponent<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      backdropOpen: false,
    };
  }

  async onSubmit(formInput: IFormInput) {
    this.setState({
      backdropOpen: true,
    });

    // no verification necessary, this is done by react-hook-form
    const email = noRefinementChecks<BookingData['email']>(
      formInput.email === '' ? undefined : formInput.email
    );

    await this.props.client.createBooking(this.props.timeslotId, {
      bookingDay: noRefinementChecks<ISO8601>(
        this.props.bookingDay.toISODate()
      ),
      name: `${formInput.firstName} ${formInput.lastName}` as NonEmptyString,
      email,
      lookupUrl: `${getBaseUrl()}/`,
    });

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
            <Typography
              className={this.props.classes.subtitle}
              variant="subtitle1"
            >
              {`Sie buchen ${
                this.props.resourceName
              } am ${this.props.bookingDay.setLocale('de-DE').toLocaleString({
                ...DateTime.DATE_SHORT,
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              })} von ${this.props.startTime
                .setLocale('de-DE')
                .toLocaleString(
                  DateTime.TIME_24_SIMPLE
                )} bis ${this.props.endTime
                .setLocale('de-DE')
                .toLocaleString(DateTime.TIME_24_SIMPLE)}.`}
            </Typography>
            <BookingForm
              isAuthenticated={this.props.isAuthenticated}
              resourceName={this.props.resourceName}
              onSubmit={this.onSubmit}
            />
          </div>
        </Container>
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

interface SettingsFormProps {
  isAuthenticated: boolean;
  resourceName: string;
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

function BookingForm(props: SettingsFormProps) {
  const { handleSubmit, control } = useForm<IFormInput>();
  const classes = useFormStyles();

  return (
    <form className={classes.form} onSubmit={handleSubmit(props.onSubmit)}>
      <Controller
        name={'firstName'}
        control={control}
        rules={{
          required: true,
        }}
        render={({ field }) => (
          <TextField
            required
            variant="outlined"
            margin="normal"
            fullWidth
            autoFocus
            label={'Vorname'}
            {...field}
          />
        )}
      />
      <Controller
        name={'lastName'}
        control={control}
        rules={{
          required: true,
        }}
        render={({ field }) => (
          <TextField
            required
            variant="outlined"
            margin="normal"
            fullWidth
            label={'Nachname'}
            {...field}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        defaultValue=""
        rules={{
          required: !props.isAuthenticated,
          pattern: {
            // eslint-disable-next-line no-useless-escape
            value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            message: 'Dies ist keine gültige E-Mail',
          },
        }}
        render={({ field, fieldState }) => (
          <TextField
            required={!props.isAuthenticated}
            variant="outlined"
            margin="normal"
            fullWidth
            label={'E-Mail'}
            autoComplete="email"
            error={!!fieldState.error}
            helperText={fieldState.error ? fieldState.error.message : null}
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
        {`${props.resourceName} buchen`}
      </Button>
    </form>
  );
}

const CreateBookingDialog = withStyles(styles)(UnstyledCreateBookingDialog);
export default CreateBookingDialog;

interface IFormInput {
  firstName: string;
  lastName: string;
  email: string;
}

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  resourceName: string;
  timeslotId: number;
  startTime: DateTime;
  endTime: DateTime;
  bookingDay: DateTime;
  changeInteractionState: changeInteractionStateT;
  isAuthenticated: boolean;
}

interface State {
  backdropOpen: boolean;
}
