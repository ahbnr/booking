import {
  Avatar,
  Button,
  Container,
  createStyles,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import React from 'react';
import DisplayableError from '../errors/DisplayableError';
import FrontendConfig from '../booking-frontend.config';
import { boundClass } from 'autobind-decorator';
import { changeInteractionStateT } from '../App';
import ErrorContactsView from './ErrorContactsView';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
    },
    progressContainer: {
      width: '100%',
      height: '80vh',
      display: 'flex',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
      width: theme.spacing(9),
      height: theme.spacing(9),
      marginBottom: theme.spacing(3),
    },
    avatarIcon: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
    okButton: {
      marginTop: theme.spacing(2),
    },
  });

@boundClass
class UnstyledErrorView extends React.PureComponent<Properties, State> {
  private savedOldPopStateListener = false;
  private oldOnPopStateListener: ((ev: PopStateEvent) => any) | null = null;

  private async onOk() {
    this.restorePopStateListener();

    this.props.clearError();
    this.props.changeInteractionState('viewingMainPage', {});
  }

  componentDidMount() {
    this.oldOnPopStateListener = window.onpopstate;
    this.savedOldPopStateListener = true;
    window.onpopstate = this.historyPopStateListener;
  }

  componentWillUnmount() {
    this.restorePopStateListener();
  }

  private historyPopStateListener(_ev: PopStateEvent) {
    this.onOk();
  }

  private restorePopStateListener() {
    if (this.savedOldPopStateListener) {
      window.onpopstate = this.oldOnPopStateListener;
      this.savedOldPopStateListener = false;
      this.oldOnPopStateListener = null;
    }
  }

  render() {
    console.error(this.props.error);

    let content;
    if (this.props.error instanceof DisplayableError) {
      content = <>{this.props.error.message}</>;
    } else {
      content = <>Bitte versuchen Sie es später noch einmal.</>;
      if (this.props.error.message != null) {
        console.error(`Error with message: ${this.props.error.message}`);
        if (this.props.error.stack != null) {
          console.error(`Stack Trace:\n\n${this.props.error.stack}`);
        }
      }
    }

    let errorContacts;
    if (FrontendConfig.errorContacts.length > 0) {
      errorContacts = (
        <>
          <p>
            Wenn der Fehler weiterhin auftritt, erhalten Sie unter folgenden
            Kontakten Hilfe:
          </p>
          <ErrorContactsView />
        </>
      );
    }

    return (
      <Container
        className={`${this.props.classes.container} ${this.props.className}`}
        component="main"
      >
        <div className={this.props.classes.paper}>
          <Avatar className={this.props.classes.avatar}>
            <ErrorIcon className={this.props.classes.avatarIcon} />
          </Avatar>
          <Typography variant="h5">Ein Fehler ist Aufgetreten</Typography>
          <Typography variant="body1" component="p">
            {content}
          </Typography>
          {errorContacts && (
            <Typography variant="body1">{errorContacts}</Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={this.onOk}
            className={this.props.classes.okButton}
          >
            Ok
          </Button>
        </div>
      </Container>
    );
  }
}

const ErrorView = withStyles(styles)(UnstyledErrorView);
export default ErrorView;

interface Properties extends WithStyles<typeof styles> {
  error: Error;
  changeInteractionState: changeInteractionStateT;
  clearError: () => unknown;
  className?: string;
}

interface State {}
