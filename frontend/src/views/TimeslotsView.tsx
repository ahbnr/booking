import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import TimeslotView from './TimeslotView';
import { Client } from '../Client';
import {
  BlockedDateGetInterface,
  timeslotCompare,
  TimeslotGetInterface,
} from 'common';
import { changeInteractionStateT } from '../App';
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
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { fabStyle } from '../styles/fab';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import ListEx from './ListEx';
import LoadingBackdrop from './LoadingBackdrop';
import { DateTime } from 'luxon';
import EventBusyIcon from '@material-ui/icons/EventBusy';
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
    backButton: {
      margin: theme.spacing(3, 0, 2),
    },
    alert: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
    fab: fabStyle(theme),
  });

@boundClass
class UnstyledTimeslotsView extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      remoteData: undefined,
      backdropOpen: false,
    };
  }

  componentDidMount() {
    this.refreshRemoteData();
  }

  private addTimeslot() {
    this.props.changeInteractionState('creatingTimeslot', {
      weekdayId: this.props.weekdayId,
    });
  }

  private refreshRemoteData() {
    const fetchRemoteData = async () => {
      const timeslots = await this.props.client.getTimeslots(
        this.props.weekdayId
      );

      const blockedDates = await this.props.client.getBlockedDatesInRange(
        this.props.bookingDay.startOf('day'),
        this.props.bookingDay.endOf('day')
      );

      const isDateBlocked = blockedDates.length > 0;

      return {
        timeslots,
        isDateBlocked,
        blockedDate: isDateBlocked ? blockedDates[0] : undefined,
      };
    };

    this.setState({
      remoteData: fetchRemoteData(),
    });
  }

  private goBack() {
    window.history.back();
  }

  private changeDateBlockedSettings() {
    this.props.changeInteractionState('updatingSettings', {
      initialTab: 'blocked-dates',
    });
  }

  render() {
    return (
      <Suspense
        fallback={<LoadingScreen />}
        asyncAction={this.state.remoteData}
        content={({ timeslots, isDateBlocked, blockedDate }) => {
          if (isDateBlocked && !this.props.isAuthenticated) {
            return (
              <Container className={this.props.classes.container} maxWidth="xs">
                <div className={this.props.classes.paper}>
                  <Avatar className={this.props.classes.avatar}>
                    <EventBusyIcon />
                  </Avatar>
                  <Typography component="h1" variant="h5" align="center">
                    Keine Termine
                  </Typography>
                  <Typography variant="body1">
                    Für den{' '}
                    {this.props.bookingDay
                      .setLocale('de-DE')
                      .toLocaleString({ ...DateTime.DATE_SHORT })}{' '}
                    werden leider keine Termine vergeben.
                  </Typography>
                  {blockedDate?.note && (
                    <Typography
                      style={{
                        fontWeight: 'bold',
                        marginTop: '0.5ex',
                        marginBottom: '0.5ex',
                      }}
                      variant="body1"
                    >
                      ({blockedDate.note})
                    </Typography>
                  )}
                  <Typography variant="body1">
                    Bitte wählen Sie im vorherigen Menü ein anderes Datum aus.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={this.props.classes.backButton}
                    onClick={this.goBack}
                  >
                    OK
                  </Button>
                </div>
              </Container>
            );
          } else {
            const sortedTimeslots: TimeslotGetInterface[] = timeslots.sort(
              timeslotCompare
            );

            return (
              <>
                <div className={this.props.classes.container}>
                  {isDateBlocked && (
                    <Alert
                      severity="warning"
                      className={this.props.classes.alert}
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={this.changeDateBlockedSettings}
                        >
                          Ändern
                        </Button>
                      }
                    >
                      <AlertTitle>Tag Gesperrt</AlertTitle>
                      <Typography variant="body1">
                        Achtung, dieses Datum (
                        {this.props.bookingDay
                          .setLocale('de-DE')
                          .toLocaleString({ ...DateTime.DATE_SHORT })}
                        ) wurde in den Einstellungen gesperrt und normale Nutzer
                        können an diesem Tag nicht buchen.
                      </Typography>
                      {blockedDate?.note && (
                        <Typography variant="body1">
                          Anmerkung: {blockedDate.note}
                        </Typography>
                      )}
                    </Alert>
                  )}
                  <ListEx
                    notEmptyTitle="Wählen Sie einen Zeitslot:"
                    emptyTitle="Keine Timeslots angelegt"
                    emptyMessage="Melden Sie sich als Administrator an und erstellen sie einige Timeslots."
                  >
                    {sortedTimeslots.map((timeslot, index) => (
                      <TimeslotView
                        key={timeslot.id}
                        index={index}
                        isAuthenticated={this.props.isAuthenticated}
                        client={this.props.client}
                        changeInteractionState={
                          this.props.changeInteractionState
                        }
                        resourceName={this.props.resourceName}
                        timeslotId={timeslot.id}
                        bookingDay={this.props.bookingDay}
                      />
                    ))}
                  </ListEx>
                </div>

                {this.props.isAuthenticated && (
                  <Fab
                    className={this.props.classes.fab}
                    variant="extended"
                    onClick={this.addTimeslot}
                    data-cy={'add-timeslot-button'}
                  >
                    <AddIcon className={this.props.classes.extendedIcon} />
                    Timeslot
                  </Fab>
                )}
                <LoadingBackdrop open={this.state.backdropOpen} />
              </>
            );
          }
        }}
      />
    );
  }
}

const TimeslotsView = withStyles(styles)(UnstyledTimeslotsView);
export default TimeslotsView;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  isAuthenticated: boolean;
  resourceName: string;
  weekdayId: number;
  bookingDay: DateTime;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  remoteData?: Promise<RemoteData>;
  backdropOpen: boolean;
}

interface RemoteData {
  timeslots: TimeslotGetInterface[];
  isDateBlocked: boolean;
  blockedDate?: BlockedDateGetInterface;
}
