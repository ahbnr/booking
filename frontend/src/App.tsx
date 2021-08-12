import React from 'react';
import './App.css';
import WeekdaysView from './views/WeekdaysView';
import { Activity, InteractionState } from './InteractionState';
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
import InviteAdminDialog from './views/InviteAdminDialog';
import SignupDialog from './views/SignupDialog';
import BookingsLookupView from './views/BookingsLookupView';
import DayOverviewView from './views/DayOverviewView';
import { ADTMember, matchI } from 'ts-adt';
import TimeslotEditDialog from './views/TimeslotEditDialog';
import ErrorBoundary from './views/ErrorBoundary';
import ErrorView from './views/ErrorView';
import ResourcesView from './views/ResourcesView';
import { construct } from './utils/constructAdt';
import AddWeekdayDialog from './views/AddWeekdayDialog';
import MainView from './views/MainView';
import ConfirmBookingDialog from './views/ConfirmBookingDialog';
import WeekdayOverviewSelector from './views/WeekdayOverviewSelector';
import SettingsDialog from './views/SettingsDialog';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexFlow: 'column',
      height: '100vh',
      paddingLeft: '0',
      paddingRight: '0',
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      paddingLeft: '0',
      paddingRight: '0',
    },
    container: {
      flexGrow: 1,
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      paddingLeft: '0',
      paddingRight: '0',
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
  private originalWindowOnPopState?: Window['onpopstate'];
  private lastStateId = 0;

  constructor(props: AppProps) {
    super(props);

    this.state = {
      isAuthenticated: false,
      interactionState: new InteractionState(construct('viewingMainPage', {})),
    };
  }

  componentDidMount() {
    window.history.pushState(this.lastStateId, 'init');
    this.originalWindowOnPopState = window.onpopstate;
    window.onpopstate = this.historyPopStateListener;

    this.client.onAuthenticationChanged = this.onAuthenticationChanged;

    const search = window.location.search;
    const signupToken = new URLSearchParams(search).get('signupToken');
    const bookingsLookupToken = new URLSearchParams(search).get('lookupToken');

    (async () => {
      // Try automatic login if we still have a refresh token
      await this.client.tryAutoAuth();

      if (signupToken != null) {
        this.changeInteractionState('signingUp', { signupToken: signupToken });
      } else if (bookingsLookupToken != null) {
        this.changeInteractionState('lookingUpBookings', {
          lookupToken: bookingsLookupToken,
        });
      }
    })();
  }

  componentWillUnmount() {
    this.client.onAuthenticationChanged = undefined;
    if (this.originalWindowOnPopState != null) {
      window.onpopstate = this.originalWindowOnPopState;
    }
    this.originalWindowOnPopState = undefined;
  }

  onAuthenticationChanged(isAuthenticated: boolean) {
    this.setState({
      isAuthenticated: isAuthenticated,
    });
  }

  changeInteractionState<
    C extends string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    T extends ADTMember<Activity, C>,
    U extends { _type: C } & T
  >(constructor: C, value: T) {
    this.setState({
      interactionState: this.state.interactionState.changeActivity(
        construct<C, T, U>(constructor, value) as Activity
      ),
    });

    window.history.pushState(++this.lastStateId, constructor);
  }

  render() {
    const view = matchI(this.state.interactionState.activity)({
      viewingResources: () => (
        <ResourcesView
          isAuthenticated={this.state.isAuthenticated}
          client={this.client}
          changeInteractionState={this.changeInteractionState}
        />
      ),
      viewingWeekdays: ({ resource }) => (
        <WeekdaysView
          resource={resource}
          isAuthenticated={this.state.isAuthenticated}
          client={this.client}
          changeInteractionState={this.changeInteractionState}
        />
      ),
      viewingTimeslots: ({ weekdayId, bookingDay }) => (
        <TimeslotsView
          isAuthenticated={this.state.isAuthenticated}
          client={this.client}
          changeInteractionState={this.changeInteractionState}
          weekdayId={weekdayId}
          bookingDay={bookingDay}
        />
      ),
      viewingBookings: ({ timeslotId, bookingDay }) => (
        <BookingsView
          client={this.client}
          timeslotId={timeslotId}
          bookingDay={bookingDay}
          changeInteractionState={this.changeInteractionState}
        />
      ),
      createBooking: ({ timeslotId, bookingDay }) => (
        <CreateBookingDialog
          client={this.client}
          changeInteractionState={this.changeInteractionState}
          timeslotId={timeslotId}
          bookingDay={bookingDay}
        />
      ),
      authenticating: () => (
        <AuthenticationDialog
          client={this.client}
          changeInteractionState={this.changeInteractionState}
        />
      ),
      invitingAdmin: () => (
        <InviteAdminDialog
          client={this.client}
          changeInteractionState={this.changeInteractionState}
        />
      ),
      signingUp: ({ signupToken }) => (
        <SignupDialog
          client={this.client}
          changeInteractionState={this.changeInteractionState}
          signupToken={signupToken}
        />
      ),
      lookingUpBookings: ({ lookupToken }) => (
        <BookingsLookupView client={this.client} lookupToken={lookupToken} />
      ),
      overviewingDay: ({ weekdayId, bookingDay }) => {
        return (
          <DayOverviewView
            isAuthenticated={this.state.isAuthenticated}
            client={this.client}
            changeInteractionState={this.changeInteractionState}
            weekdayId={weekdayId}
            bookingDay={bookingDay}
          />
        );
      },
      editingTimeslot: ({ timeslot }) => (
        <TimeslotEditDialog
          client={this.client}
          changeInteractionState={this.changeInteractionState}
          mode={construct('editMode', { timeslot })}
        />
      ),
      creatingTimeslot: ({ weekdayId }) => (
        <TimeslotEditDialog
          client={this.client}
          changeInteractionState={this.changeInteractionState}
          mode={construct('createMode', { weekdayId })}
        />
      ),
      addingWeekday: ({ existingWeekdayNames, resource }) => (
        <AddWeekdayDialog
          client={this.client}
          changeInteractionState={this.changeInteractionState}
          existingWeekdayNames={existingWeekdayNames}
          resource={resource}
        />
      ),
      viewingMainPage: () => (
        <MainView changeInteractionState={this.changeInteractionState} />
      ),
      confirmingBookingDialog: () => <ConfirmBookingDialog />,
      selectingWeekdayOverview: () => (
        <WeekdayOverviewSelector
          client={this.client}
          changeInteractionState={this.changeInteractionState}
        />
      ),
      updatingSettings: () => <SettingsDialog client={this.client} />,
    });

    return (
      <>
        <div className={this.props.classes.root}>
          <CssBaseline />
          <AppBar
            client={this.client}
            isAuthenticated={this.state.isAuthenticated}
            changeInteractionState={this.changeInteractionState}
          />
          <main className={this.props.classes.content}>
            <div className={this.props.classes.appBarSpacer} />
            <Container maxWidth="lg" className={this.props.classes.container}>
              <ErrorBoundary fallback={(e) => <ErrorView error={e} />}>
                {view}
              </ErrorBoundary>
            </Container>
          </main>
        </div>
      </>
    );
  }

  historyPopStateListener(ev: PopStateEvent) {
    // FIXME: Handle arbitrary history jump
    if (ev.state === this.lastStateId - 1) {
      // back button
      const previous = this.state.interactionState.goBack();

      if (previous != null) {
        this.setState({
          interactionState: previous,
        });

        this.lastStateId = ev.state;
      }
    } else if (ev.state === this.lastStateId + 1) {
      // forward button
      const next = this.state.interactionState.goNext();

      if (next != null) {
        this.setState({
          interactionState: next,
        });

        this.lastStateId = ev.state;
      }
    }
  }
}

const App = withStyles(styles)(UnstyledApp);

interface AppProps extends WithStyles<typeof styles> {}

interface AppState {
  isAuthenticated: boolean;
  interactionState: InteractionState;
}

export default App;

export type changeInteractionStateT = UnstyledApp['changeInteractionState'];
