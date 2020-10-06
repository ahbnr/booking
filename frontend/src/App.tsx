import React from 'react';
import './App.css';
import WeekdaysView from './views/WeekdaysView';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  InteractionState,
  SigningUp,
  ViewingResources,
} from './InteractionState';
import { boundClass } from 'autobind-decorator';
import TimeslotsView from './views/TimeslotsView';
import CreateBookingDialog from './views/CreateBookingDialog';
import BookingsView from './views/BookingsView';
import { Client } from './Client';
import AuthenticationDialog from './views/AuthenticationDialog';
import AppBar from './views/AppBar';
import {
  Container,
  createStyles,
  CssBaseline,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import ResourcesView from './views/ResourcesView';
import InviteAdminDialog from './views/InviteAdminDialog';
import SignupDialog from './views/SignupDialog';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      height: '100vh',
      overflow: 'auto',
    },
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: 240,
    },
  });

@boundClass
class UnstyledApp extends React.Component<AppProps, AppState> {
  public static displayName = 'App';
  private client: Client = new Client();

  constructor(props: AppProps) {
    super(props);

    this.state = {
      isAuthenticated: false,
      interactionState: new ViewingResources(),
    };
  }

  componentDidMount() {
    this.client.onAuthenticationChanged = this.onAuthenticationChanged;

    const search = window.location.search;
    const signupToken = new URLSearchParams(search).get('token');
    if (signupToken != null) {
      this.changeInteractionState(new SigningUp(signupToken));
    }
  }

  componentWillUnmount() {
    this.client.onAuthenticationChanged = undefined;
  }

  onAuthenticationChanged(isAuthenticated: boolean) {
    this.setState({
      isAuthenticated: isAuthenticated,
    });
  }

  changeInteractionState(interactionState: InteractionState) {
    this.setState({
      interactionState: interactionState,
    });
  }

  render() {
    let view;
    switch (this.state.interactionState.type) {
      case 'ViewingResources':
        view = (
          <ResourcesView
            isAuthenticated={this.state.isAuthenticated}
            client={this.client}
            changeInteractionState={this.changeInteractionState}
          />
        );
        break;
      case 'ViewingWeekdays':
        view = (
          <WeekdaysView
            resource={this.state.interactionState.resource}
            isAuthenticated={this.state.isAuthenticated}
            client={this.client}
            changeInteractionState={this.changeInteractionState}
          />
        );
        break;
      case 'ViewingTimeslots':
        view = (
          <TimeslotsView
            isAuthenticated={this.state.isAuthenticated}
            client={this.client}
            changeInteractionState={this.changeInteractionState}
            weekday={this.state.interactionState.weekday}
          />
        );
        break;

      case 'ViewingBookings':
        view = (
          <BookingsView
            client={this.client}
            timeslotId={this.state.interactionState.timeslot.id}
          />
        );
        break;

      case 'CreateBooking':
        view = (
          <CreateBookingDialog
            client={this.client}
            changeInteractionState={this.changeInteractionState}
            timeslot={this.state.interactionState.timeslot}
          />
        );
        break;

      case 'Authenticating':
        view = (
          <AuthenticationDialog
            client={this.client}
            changeInteractionState={this.changeInteractionState}
          />
        );
        break;

      case 'InvitingAdmin':
        view = (
          <InviteAdminDialog
            client={this.client}
            changeInteractionState={this.changeInteractionState}
          />
        );
        break;

      case 'SigningUp':
        view = (
          <SignupDialog
            client={this.client}
            changeInteractionState={this.changeInteractionState}
            signupToken={this.state.interactionState.signupToken}
          />
        );
        break;
    }

    return (
      <>
        <div className={this.props.classes.root}>
          <CssBaseline />
          <AppBar
            isAuthenticated={this.state.isAuthenticated}
            changeInteractionState={this.changeInteractionState}
          />
          <main className={this.props.classes.content}>
            <div className={this.props.classes.appBarSpacer} />
            <Container maxWidth="lg" className={this.props.classes.container}>
              {view}
            </Container>
          </main>
        </div>
      </>
    );
  }
}

const App = withStyles(styles)(UnstyledApp);

interface AppProps extends WithStyles<typeof styles> {}

interface AppState {
  isAuthenticated: boolean;
  interactionState: InteractionState;
}

export default App;
