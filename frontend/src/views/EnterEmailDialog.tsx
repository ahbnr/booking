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
import EmailIcon from '@material-ui/icons/Email';
import { changeInteractionStateT } from '../App';
import { DateTime } from 'luxon';
import { Controller, useForm } from 'react-hook-form';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  WithTranslation,
  withTranslation,
  useTranslation,
} from 'react-i18next';
import {
  EMailString,
  ISO8601,
  NonEmptyString,
  noRefinementChecks,
} from 'common';
import getBaseUrl from '../utils/getBaseUrl';
import DisplayableError from '../errors/DisplayableError';
import { Alert } from '@material-ui/lab';
import LoadingBackdrop from './LoadingBackdrop';

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
class UnstyledEnterEmailDialog extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = { backdropOpen: false };
  }

  async onSubmit(formInput: IFormInput) {
    this.setState({
      backdropOpen: true,
    });

    // no verification necessary, this is done by react-hook-form
    const email = noRefinementChecks<EMailString>(formInput.email);

    try {
      const createResponse = await this.props.client.createBookings(
        this.props.timeslotId,
        {
          bookingDay: noRefinementChecks<ISO8601>(
            this.props.bookingDay.toISODate()
          ),
          participantNames: this.props.participantNames,
          email,
          lookupUrl: `${getBaseUrl()}/`,
        }
      );

      this.props.changeInteractionState('confirmingBookingDialog', {
        createResponse,
        mailAddress: email,
        resourceName: this.props.resourceName,
        timeslotId: this.props.timeslotId,
        timeslotCapacity: this.props.timeslotCapacity,
        numBookingsForSlot: this.props.numBookingsForSlot,
        startTime: this.props.startTime,
        endTime: this.props.endTime,
        bookingDay: this.props.bookingDay,
        participantNames: this.props.participantNames,
      });
    } catch (e) {
      throw new DisplayableError(
        'Konnte Buchungen nicht erstellen. Eventuell hat jemand anderes den Platz inzwischen gebucht. Versuchen Sie einen anderen Zeitslot zu wählen.',
        e
      );
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
              <EmailIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Ihre E-Mail
            </Typography>
            <Typography
              className={this.props.classes.subtitle}
              variant="subtitle1"
            >
              Bitte geben Sie Ihre E-Mail an:
            </Typography>
            <EmailForm
              onSubmit={this.onSubmit}
              isAuthenticated={this.props.isAuthenticated}
              resourceName={this.props.resourceName}
              startTime={this.props.startTime}
              endTime={this.props.endTime}
              bookingDay={this.props.bookingDay}
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
  startTime: DateTime;
  endTime: DateTime;
  bookingDay: DateTime;
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
  confirmText: {
    marginTop: theme.spacing(2),
  },
}));

function EmailForm(props: SettingsFormProps) {
  const { handleSubmit, control } = useForm<IFormInput>();
  const classes = useFormStyles();
  const { t } = useTranslation();

  return (
    <form className={classes.form} onSubmit={handleSubmit(props.onSubmit)}>
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

      <Alert severity="info" className={classes.confirmText}>
        {t('enter-email-dialog-info', {
          resourceName: props.resourceName,
          startDate: props.bookingDay.setLocale('de-DE').toLocaleString({
            ...DateTime.DATE_SHORT,
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          }),
          startTime: props.startTime
            .setLocale('de-DE')
            .toLocaleString(DateTime.TIME_24_SIMPLE),
          endTime: props.endTime
            .setLocale('de-DE')
            .toLocaleString(DateTime.TIME_24_SIMPLE),
        })}
      </Alert>

      <Button
        fullWidth
        variant="contained"
        color="primary"
        type="submit"
        className={classes.submit}
      >
        {`Buchen`}
      </Button>
    </form>
  );
}

const EnterEmailDialog = withTranslation()(
  withStyles(styles)(UnstyledEnterEmailDialog)
);
export default EnterEmailDialog;

interface IFormInput {
  email: string;
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
  participantNames: NonEmptyString[];
  changeInteractionState: changeInteractionStateT;
  isAuthenticated: boolean;
}

interface State {
  backdropOpen: boolean;
}
