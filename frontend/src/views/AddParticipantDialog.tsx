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
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { changeInteractionStateT } from '../App';
import { DateTime } from 'luxon';
import { Controller, useForm } from 'react-hook-form';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { WithTranslation, withTranslation } from 'react-i18next';
import { NonEmptyString } from 'common';

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
class UnstyledAddParticipantDialog extends React.PureComponent<
  Properties,
  State
> {
  async onSubmit(formInput: IFormInput) {
    this.props.changeInteractionState('confirmingParticipants', {
      resourceName: this.props.resourceName,
      timeslotId: this.props.timeslotId,
      timeslotCapacity: this.props.timeslotCapacity,
      numBookingsForSlot: this.props.numBookingsForSlot,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      bookingDay: this.props.bookingDay,
      participantNames: this.props.participantNames.concat([
        `${formInput.firstName} ${formInput.lastName}` as NonEmptyString,
      ]),
    });
  }

  render() {
    return (
      <>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={this.props.classes.paper}>
            <Avatar className={this.props.classes.avatar}>
              <PersonAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Person Hinzufügen
            </Typography>
            <Typography
              className={this.props.classes.subtitle}
              variant="subtitle1"
            >
              Bitte geben Sie den Namen der nächsten Person Ihrer Gruppe an:
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

const AddParticipantDialog = withTranslation()(
  withStyles(styles)(UnstyledAddParticipantDialog)
);
export default AddParticipantDialog;

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
  participantNames: NonEmptyString[];
  changeInteractionState: changeInteractionStateT;
  isAuthenticated: boolean;
}

interface State {
  backdropOpen: boolean;
}
