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
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Client } from '../Client';
import { InteractionState, ViewingResources } from '../InteractionState';

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
class UnstyledAuthenticationDialog extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      userName: '',
      userNameError: undefined,
      password: '',
      passwordError: undefined,
    };
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
    await this.props.client.authenticate(
      this.state.userName,
      this.state.password
    );

    this.props.changeInteractionState(new ViewingResources());
  }

  render() {
    return (
      <>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={this.props.classes.paper}>
            <Avatar className={this.props.classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Login
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
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={this.props.classes.submit}
                disabled={!this.canBeSubmitted()}
                onClick={this.onSubmit}
              >
                Einloggen
              </Button>
            </form>
          </div>
        </Container>
      </>
    );
  }
}

const AuthenticationDialog = withStyles(styles)(UnstyledAuthenticationDialog);
export default AuthenticationDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  changeInteractionState: (interactionState: InteractionState) => unknown;
}

interface State {
  userName: string;
  userNameError?: string;
  password: string;
  passwordError?: string;
}
