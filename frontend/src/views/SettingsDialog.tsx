import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Checkbox,
  Container,
  createStyles,
  CssBaseline,
  FormControlLabel,
  FormGroup,
  TextField,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { Client } from '../Client';
import SettingsIcon from '@material-ui/icons/Settings';
import { SettingsGetInterface } from 'common';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import { Controller, useForm } from 'react-hook-form';
import makeStyles from '@material-ui/core/styles/makeStyles';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
  });

@boundClass
class UnstyledSettingsDialog extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      getSettings: undefined,
    };
  }

  componentDidMount() {
    this.setState({
      getSettings: this.props.client.getSettings(),
    });
  }

  async onSubmit(formInput: IFormInput) {
    const deadlineMillis = formInput.bookingDeadlineHours * 3600000;

    const request = this.props.client.updateSettings({
      bookingDeadlineMillis: deadlineMillis,
      maxBookingWeekDistance: formInput.maxBookingWeekDistanceDisabled
        ? -1
        : formInput.maxBookingWeekDistance,
    });

    this.setState({
      getSettings: request,
    });
  }

  render() {
    return (
      <Suspense
        asyncAction={this.state.getSettings}
        fallback={<LoadingScreen />}
        content={(remoteSettings) => {
          return (
            <Container component="main" maxWidth="xs">
              <CssBaseline />
              <div className={this.props.classes.paper}>
                <Avatar className={this.props.classes.avatar}>
                  <SettingsIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Einstellungen
                </Typography>
                <SettingsForm
                  onSubmit={this.onSubmit}
                  remoteSettings={remoteSettings}
                />
              </div>
            </Container>
          );
        }}
      />
    );
  }
}

interface IFormInput {
  bookingDeadlineHours: number;
  maxBookingWeekDistanceDisabled: boolean;
  maxBookingWeekDistance: number;
}

interface SettingsFormProps {
  onSubmit: (formInput: IFormInput) => unknown;
  remoteSettings: SettingsGetInterface;
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

function SettingsForm(props: SettingsFormProps) {
  const bookingDeadlineHours = Math.ceil(
    props.remoteSettings.bookingDeadlineMillis / 3600000
  );
  const maxBookingWeekDistanceDisabled =
    props.remoteSettings.maxBookingWeekDistance < 0;

  const maxBookingWeekDistance = Math.max(
    0,
    props.remoteSettings.maxBookingWeekDistance
  );

  const { watch, formState, handleSubmit, control } = useForm<IFormInput>({
    defaultValues: {
      bookingDeadlineHours,
      maxBookingWeekDistanceDisabled,
      maxBookingWeekDistance,
    },
  });
  const classes = useFormStyles();

  const watchMaxBookingWeekDistanceDisabled = watch(
    'maxBookingWeekDistanceDisabled',
    maxBookingWeekDistanceDisabled
  );

  return (
    <>
      <form className={classes.form} onSubmit={handleSubmit(props.onSubmit)}>
        <Controller
          name="bookingDeadlineHours"
          control={control}
          rules={{ required: true, min: 0 }}
          render={({ field }) => (
            <TextField
              required
              variant="outlined"
              type="number"
              margin="normal"
              fullWidth
              label={'Stunden bevor Anmeldeschluss'}
              autoFocus
              {...field}
              onChange={(e) =>
                field.onChange(Math.max(0, parseInt(e.target.value)))
              }
              value={Math.max(0, field.value)}
            />
          )}
        />
        <FormGroup row>
          <Controller
            control={control}
            name="maxBookingWeekDistanceDisabled"
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Unbegrenzte Vorausbuchungen"
              />
            )}
          />
        </FormGroup>
        {!watchMaxBookingWeekDistanceDisabled && (
          <Controller
            name="maxBookingWeekDistance"
            control={control}
            rules={{ min: 0 }}
            render={({ field }) => (
              <TextField
                required
                variant="outlined"
                type="number"
                margin="normal"
                fullWidth
                label={'Maximale Anzahl Wochen zur Vorausbuchung'}
                {...field}
                onChange={(e) =>
                  field.onChange(Math.max(0, parseInt(e.target.value)))
                }
                value={Math.max(0, field.value)}
              />
            )}
          />
        )}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          type="submit"
        >
          Bestätigen
        </Button>
      </form>
    </>
  );
}

const SettingsDialog = withStyles(styles)(UnstyledSettingsDialog);
export default SettingsDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
}

interface State {
  getSettings: Promise<SettingsGetInterface> | undefined;
}
