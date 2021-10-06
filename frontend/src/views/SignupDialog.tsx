import React, { ChangeEvent } from 'react';
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
  withStyles,
} from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { Client } from '../Client';
import { assertNever, NonEmptyString, noRefinementChecks } from 'common';
import { changeInteractionStateT } from '../App';
import LoadingScreen from './LoadingScreen';
import LoadingBackdrop from './LoadingBackdrop';
import { Alert, AlertTitle } from '@material-ui/lab';

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
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  });

@boundClass
class UnstyledSignupDialog extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      isSignupTokenOk: undefined,
      userName: '',
      userNameError: undefined,
      password: '',
      passwordError: undefined,
      backdropOpen: false,
    };
  }

  async componentDidMount() {
    const isSignupTokenOk = await this.props.client.isSignupTokenOk(
      this.props.signupToken
    );

    this.setState({
      isSignupTokenOk: isSignupTokenOk,
    });
  }

  onUsernameChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = changeEvent.target.value;

    this.setState({
      userName: value,
      userNameError: value.length > 0 ? undefined : 'Bitte ausfüllen',
    });
  }

  onPasswordChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = changeEvent.target.value;

    this.setState({
      password: value,
      passwordError: value.length > 0 ? undefined : 'Bitte ausfüllen',
    });
  }

  canBeSubmitted(): boolean {
    return (
      this.state.userName.length > 0 &&
      this.state.userNameError == null &&
      this.state.password.length > 0 &&
      this.state.passwordError == null
    );
  }

  async onSubmit() {
    if (this.props.signupToken != null) {
      this.setState({
        backdropOpen: true,
      });

      const username = this.state.userName;
      const password = this.state.password;
      const response = await this.props.client.signup(
        noRefinementChecks<NonEmptyString>(this.props.signupToken),
        noRefinementChecks<NonEmptyString>(username),
        noRefinementChecks<NonEmptyString>(password)
      );

      switch (response.kind) {
        case 'success':
          await this.props.client.login(username, password);
          window.history.back();
          break;
        case 'failure':
          {
            let errorMessage: string;
            switch (response.reason) {
              case 'existing_mail':
                errorMessage =
                  'Es ist bereits ein Administrator mit dieser E-Mail Adresse registriert.';
                break;
              case 'existing_name':
                errorMessage =
                  'Es ist bereits ein Administrator mit diesem Namen registriert. Bitte wählen Sie einen anderen Nutzernamen.';
                break;
              default:
                assertNever();
            }
            this.setState({ requestError: errorMessage, backdropOpen: false });
          }
          break;
        default:
          assertNever();
      }
    }
  }

  render() {
    if (this.state.isSignupTokenOk === true) {
      return (
        <>
          <Container
            className={this.props.classes.container}
            component="main"
            maxWidth="xs"
          >
            <div className={this.props.classes.paper}>
              <Avatar className={this.props.classes.avatar}>
                <PersonAddIcon />
              </Avatar>
              <Typography component="h1" variant="h5" align="center">
                Ein Konto Anlegen
              </Typography>
              <form className={this.props.classes.form} noValidate>
                <TextField
                  required
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label={'Nutzer'}
                  autoFocus
                  value={this.state.userName}
                  error={this.state.userNameError != null}
                  helperText={this.state.userNameError}
                  onChange={this.onUsernameChanged}
                  inputProps={{ maxLength: 32 }}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label={'Passwort'}
                  type="password"
                  autoComplete="current-password"
                  value={this.state.password}
                  error={this.state.passwordError != null}
                  helperText={this.state.passwordError}
                  onChange={this.onPasswordChanged}
                  inputProps={{ maxLength: 64 }}
                />
                {this.state.requestError != null && (
                  <Alert severity="error">
                    <AlertTitle>Registrierung Fehlgeschlagen</AlertTitle>
                    {this.state.requestError}
                  </Alert>
                )}
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={this.props.classes.submit}
                  disabled={!this.canBeSubmitted()}
                  onClick={this.onSubmit}
                >
                  Anmelden
                </Button>
              </form>
            </div>
          </Container>
          <LoadingBackdrop open={this.state.backdropOpen} />
        </>
      );
    } else if (this.state.isSignupTokenOk === false) {
      return (
        <div className={this.props.classes.container}>
          <Alert severity="error">
            <AlertTitle>Einladungslink abgelaufen</AlertTitle>
            Der Einladungslink ist leider abgelaufen oder wurde bereits für eine
            Registrierung benutzt. Bitte beantragen sie einen neuen.
          </Alert>
        </div>
      );
    } else {
      return <LoadingScreen />;
    }
  }
}

const SignupDialog = withStyles(styles)(UnstyledSignupDialog);
export default SignupDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  changeInteractionState: changeInteractionStateT;
  signupToken: string;
}

interface State {
  isSignupTokenOk?: boolean;
  userName: string;
  userNameError?: string;
  password: string;
  passwordError?: string;
  requestError?: string;
  backdropOpen: boolean;
}
