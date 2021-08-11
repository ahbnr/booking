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
import { Client } from '../Client';
import SettingsIcon from '@material-ui/icons/Settings';
import { SettingsGetInterface } from 'common/dist/typechecking/api/Settings';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';

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
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  });

@boundClass
class UnstyledSettingsDialog extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      getSettings: undefined,
      updateSettings: undefined,
    };
  }

  componentDidMount() {
    this.setState({
      getSettings: this.props.client.getSettings(),
    });
  }

  onDeadlineChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = changeEvent.target.value;
    const intValue = parseInt(value);

    if (value === '' || intValue >= 0) {
      this.setState({
        updateSettings: {
          ...this.state.updateSettings,
          bookingDeadlineHours: value,
        },
      });
    }
  }

  canBeSubmitted(): boolean {
    return this.state.updateSettings != null;
  }

  async onSubmit() {
    if (this.state.updateSettings != null) {
      let deadlineMillis =
        parseInt(this.state.updateSettings.bookingDeadlineHours) * 3600000;
      if (this.state.updateSettings.bookingDeadlineHours === '') {
        deadlineMillis = 0;
      }

      const request = this.props.client.updateSettings({
        bookingDeadlineMillis: deadlineMillis,
      });

      this.setState({
        getSettings: request,
        updateSettings: undefined,
      });
    } else {
      console.error('Dont call submit if you have no data to submit');
    }
  }

  render() {
    return (
      <Suspense
        asyncAction={this.state.getSettings}
        fallback={<LoadingScreen />}
        onLoaded={(settings) =>
          this.setState({
            updateSettings: {
              bookingDeadlineHours: Math.ceil(
                settings.bookingDeadlineMillis / 3600000
              ).toString(),
            },
          })
        }
        content={(_) => {
          if (this.state.updateSettings == null) {
            return <LoadingScreen />;
          }

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
                <div className={this.props.classes.form}>
                  <TextField
                    required
                    variant="outlined"
                    type="number"
                    margin="normal"
                    fullWidth
                    label={'Stunden bevor Anmeldeschluss'}
                    autoFocus
                    value={this.state.updateSettings.bookingDeadlineHours}
                    onChange={this.onDeadlineChanged}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={this.props.classes.submit}
                    disabled={!this.canBeSubmitted()}
                    onClick={this.onSubmit}
                  >
                    Bestätigen
                  </Button>
                </div>
              </div>
            </Container>
          );
        }}
      />
    );
  }
}

const SettingsDialog = withStyles(styles)(UnstyledSettingsDialog);
export default SettingsDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
}

interface State {
  getSettings: Promise<SettingsGetInterface> | undefined;
  updateSettings: { bookingDeadlineHours: string } | undefined;
}
