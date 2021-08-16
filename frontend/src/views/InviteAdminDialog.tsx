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
  withStyles,
} from '@material-ui/core';
import { Client } from '../Client';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import getBaseUrl from '../utils/getBaseUrl';
import { EMailString } from 'common/dist';
import { changeInteractionStateT } from '../App';
import LoadingBackdrop from './LoadingBackdrop';
import { Alert, AlertTitle } from '@material-ui/lab';
import { withForm, WithForm } from '../utils/WithReactHookForm';
import { Controller } from 'react-hook-form';

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
class UnstyledInviteAdminDialog extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      email: '',
      emailError: undefined,
      backdropOpen: false,
    };
  }

  canBeSubmitted(): boolean {
    return this.state.email.length > 0 && this.state.emailError == null;
  }

  async onSubmit(formInput: IFormInput) {
    console.log(formInput);
    this.setState({
      backdropOpen: true,
    });
    const response = await this.props.client.inviteForSignup(
      formInput.email as EMailString,
      `${getBaseUrl()}/`
    );

    switch (response.kind) {
      case 'success':
        window.history.back();
        break;
      case 'failure':
        this.setState({
          backdropOpen: false,
          requestError:
            'Die Einladung konnte nicht verschickt werden. Eventuell ist bereits ein Administrator mit dieser E-Mail registriert?',
        });
    }
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
            <form
              className={this.props.classes.form}
              onSubmit={this.props.handleSubmit(this.onSubmit)}
            >
              <Controller
                name="email"
                control={this.props.control}
                defaultValue=""
                rules={{
                  required: true,
                  pattern: {
                    // eslint-disable-next-line no-useless-escape
                    value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: 'Dies ist keine gültige E-Mail',
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    required
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label={'E-Mail'}
                    autoComplete="email"
                    autoFocus
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error ? fieldState.error.message : null
                    }
                    {...field}
                  />
                )}
              />
              {this.state.requestError != null && (
                <Alert severity="error">
                  <AlertTitle>Einladung fehlgeschlagen</AlertTitle>
                  {this.state.requestError}
                </Alert>
              )}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={this.props.classes.submit}
                type="submit"
                disabled={
                  !this.props.formState.isValid || !this.props.formState.isDirty
                }
              >
                Einladen
              </Button>
            </form>
          </div>
        </Container>
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const InviteAdminDialog = withForm({ mode: 'onChange' })(
  withStyles(styles)(UnstyledInviteAdminDialog)
);
export default InviteAdminDialog;

interface IFormInput {
  email: string;
}

interface Properties extends WithStyles<typeof styles>, WithForm<IFormInput> {
  client: Client;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  email: string;
  emailError?: string;
  requestError?: string;
  backdropOpen: boolean;
}
