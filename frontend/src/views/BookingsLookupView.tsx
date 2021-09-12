import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { Client } from '../Client';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  Avatar,
  createStyles,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import {
  BookingGetInterface,
  TimeslotGetInterface,
  WeekdayGetInterface,
} from 'common';
import DeleteIcon from '@material-ui/icons/Delete';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import LoadingBackdrop from './LoadingBackdrop';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import flow from 'lodash/fp/flow';
import sortBy from 'lodash/fp/sortBy';
import { DateTime } from 'luxon';
import map from 'lodash/fp/map';
import DeleteConfirmer from './DeleteConfirmer';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
    mainText: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    paper: {
      paddingTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    textSection: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
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
  });

@boundClass
class UnstyledBookingsLookupView extends React.PureComponent<
  Properties,
  State
> {
  public static readonly displayName = 'BookingsLookupView';

  constructor(props: Properties) {
    super(props);

    this.state = {
      remoteData: undefined,
      backdropOpen: false,
    };
  }

  componentDidMount() {
    this.refreshData();
  }

  refreshData() {
    this.setState({
      remoteData: this.fetchData(),
    });
  }

  async fetchData(): Promise<RemoteData> {
    const bookings = await this.props.client.getBookingsByToken(
      this.props.lookupToken
    );

    const timeslots = new Map<number, TimeslotGetInterface>();
    const weekdays = new Map<number, WeekdayGetInterface>();

    for (const booking of bookings) {
      const timeslot = await this.props.client.getTimeslot(booking.timeslotId);
      timeslots.set(booking.timeslotId, timeslot);

      const weekday = await this.props.client.getWeekday(timeslot.weekdayId);
      weekdays.set(timeslot.weekdayId, weekday);
    }

    return {
      bookings: bookings,
      timeslots: timeslots,
      weekdays: weekdays,
    };
  }

  async deleteBooking(bookingId: number) {
    this.setState({
      backdropOpen: true,
    });
    await this.props.client.deleteBookingByToken(
      bookingId,
      this.props.lookupToken
    );
    this.setState({
      backdropOpen: false,
    });

    this.refreshData();
  }

  render() {
    return (
      <>
        <Suspense
          asyncAction={this.state.remoteData}
          fallback={<LoadingScreen />}
          content={(remoteData) => {
            if (remoteData.bookings.length === 0) {
              return (
                <div className={this.props.classes.paper}>
                  <Avatar className={this.props.classes.avatar}>
                    <MoodBadIcon className={this.props.classes.avatarIcon} />
                  </Avatar>
                  <Typography variant="h5">Keine Buchungen</Typography>
                  <Typography variant="body1">
                    Für Sie liegen keine Buchungen vor.
                  </Typography>
                </div>
              );
            }

            interface DisplayData {
              booking: BookingGetInterface;
              startDate: DateTime;
              endDate: DateTime;
              resourceName: string;
            }

            const sortedBookings = flow(
              map((booking: BookingGetInterface) => {
                const weekdayId =
                  remoteData.timeslots.get(booking.timeslotId)?.weekdayId || -1;
                const resourceName =
                  remoteData.weekdays.get(weekdayId)?.resourceName || '';

                return {
                  booking: booking,
                  startDate: DateTime.fromISO(booking.startDate).setLocale(
                    'de-DE'
                  ),
                  endDate: DateTime.fromISO(booking.endDate).setLocale('de-DE'),
                  resourceName,
                };
              }),
              sortBy((displayData: DisplayData) => displayData.startDate)
            )(remoteData.bookings);

            return (
              <>
                <div className={this.props.classes.textSection}>
                  <Typography variant="h4">Ihre Buchungen</Typography>
                  <Typography
                    variant="body1"
                    className={this.props.classes.mainText}
                  >
                    Sie können eine Buchung löschen, indem Sie auf das
                    &quot;Eimer&quot;-Symbol an der rechten Seite einer Buchung
                    klicken.
                  </Typography>
                </div>

                <List>
                  {sortedBookings.map(
                    ({ booking, startDate, endDate, resourceName }) => (
                      <ListItem key={booking.id}>
                        <ListItemText>
                          {startDate.toLocaleString(DateTime.DATE_SHORT)},
                          &ldquo;{resourceName}&rdquo; von{' '}
                          {startDate.toLocaleString(DateTime.TIME_24_SIMPLE)}{' '}
                          bis {endDate.toLocaleString(DateTime.TIME_24_SIMPLE)}
                        </ListItemText>
                        <ListItemSecondaryAction>
                          <DeleteConfirmer name="die Buchung">
                            <IconButton
                              onClick={() => this.deleteBooking(booking.id)}
                              edge="end"
                              aria-label="delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </DeleteConfirmer>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )
                  )}
                </List>
              </>
            );
          }}
        />
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const BookingsLookupView = withTranslation()(
  withStyles(styles)(UnstyledBookingsLookupView)
);
export default BookingsLookupView;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  client: Client;
  lookupToken: string;
}

interface State {
  remoteData?: Promise<RemoteData>;
  backdropOpen: boolean;
}

type RemoteData = {
  bookings: BookingGetInterface[];
  timeslots: Map<number, TimeslotGetInterface>;
  weekdays: Map<number, WeekdayGetInterface>;
};
