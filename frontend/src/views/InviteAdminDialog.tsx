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
import { InteractionState, ViewingResources } from '../InteractionState';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import getBaseUrl from '../utils/getBaseUrl';
import { EMailString } from 'common/dist';

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
class UnstyledInviteAdminDialog extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      email: '',
      emailError: undefined,
    };
  }

  onEmailChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = changeEvent.target.value;

    this.setState({
      email: value,
      emailError: value.length > 0 ? undefined : 'Bitte ausfüllen',
    });
  }

  canBeSubmitted(): boolean {
    return this.state.email.length > 0 && this.state.emailError == null;
  }

  async onSubmit() {
    await this.props.client.inviteForSignup(
      this.state.email as EMailString,
      `${getBaseUrl()}/`
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
              <PersonAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Admin Hinzufügen
            </Typography>
            <form className={this.props.classes.form} noValidate>
              <TextField
                required
                variant="outlined"
                margin="normal"
                fullWidth
                label={'E-Mail'}
                autoComplete="email"
                autoFocus
                value={this.state.email}
                error={this.state.email != null}
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
                Einladen
              </Button>
            </form>
          </div>
        </Container>
      </>
    );
  }
}

const InviteAdminDialog = withStyles(styles)(UnstyledInviteAdminDialog);
export default InviteAdminDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  changeInteractionState: (interactionState: InteractionState) => unknown;
}

interface State {
  email: string;
  emailError?: string;
}
