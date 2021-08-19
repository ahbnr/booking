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
import { EMailString } from 'common';
import { changeInteractionStateT } from '../App';
import LoadingBackdrop from './LoadingBackdrop';
import { Alert, AlertTitle } from '@material-ui/lab';
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
class UnstyledInviteAdminDialog extends React.PureComponent<Properties, State> {
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
            <InviteAdminForm
              onSubmit={this.onSubmit}
              requestError={this.state.requestError}
            />
          </div>
        </Container>
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const InviteAdminDialog = withStyles(styles)(UnstyledInviteAdminDialog);
export default InviteAdminDialog;

interface IFormInput {
  email: string;
}

interface InviteAdminFormProps {
  onSubmit: (formInput: IFormInput) => unknown;
  requestError?: string;
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

function InviteAdminForm(props: InviteAdminFormProps) {
  const { handleSubmit, control } = useForm<IFormInput>({
    defaultValues: {
      email: '',
    },
  });
  const classes = useFormStyles();

  return (
    <form className={classes.form} onSubmit={handleSubmit(props.onSubmit)}>
      <Controller
        name="email"
        control={control}
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
            autoFocus
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
      {props.requestError != null && (
        <Alert severity="error">
          <AlertTitle>Einladung fehlgeschlagen</AlertTitle>
          {props.requestError}
        </Alert>
      )}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
        type="submit"
      >
        Einladen
      </Button>
    </form>
  );
}

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  requestError?: string;
  backdropOpen: boolean;
}
