import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { Client } from '../Client';
import {
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
  timeslotCompare,
  TimeslotGetInterface,
  WeekdayGetInterface,
} from 'common/dist';
import DeleteIcon from '@material-ui/icons/Delete';
import { nameSorter } from '../models/WeekdayUtils';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import LoadingBackdrop from './LoadingBackdrop';

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
  });

@boundClass
class UnstyledBookingsLookupView extends React.Component<Properties, State> {
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
            const renderData = new Map<
              number,
              Map<number, BookingGetInterface[]>
            >();

            for (const booking of remoteData.bookings) {
              const timeslot = remoteData.timeslots.get(booking.timeslotId);

              if (timeslot != null) {
                const timeslotMap = renderData.getOrDefault(
                  timeslot.weekdayId,
                  new Map<number, BookingGetInterface[]>()
                );

                const bookingArray = timeslotMap.getOrDefault(timeslot.id, []);

                bookingArray.push(booking);

                timeslotMap.set(timeslot.id, bookingArray);
                renderData.set(timeslot.weekdayId, timeslotMap);
              } else {
                throw new Error(
                  `Timeslot data (id: ${booking.timeslotId}) not downloaded even though it should be. This is a programming error.`
                );
              }
            }

            const renderList: [
              WeekdayGetInterface,
              [TimeslotGetInterface, BookingGetInterface[]][]
            ][] = Array.from(renderData.entries()).map(
              (
                weekdayAndTimeslotMap: [
                  number,
                  Map<number, BookingGetInterface[]>
                ]
              ) => {
                const [weekdayId, timeslotMap] = weekdayAndTimeslotMap;

                const weekday = remoteData.weekdays.get(weekdayId);
                if (weekday == null) {
                  throw new Error(
                    `Weekday data (id: ${weekdayId}) not downloaded, even though it should be. This should never happen and is a programming error.`
                  );
                }

                const timeslotBookingsArray: [
                  TimeslotGetInterface,
                  BookingGetInterface[]
                ][] = Array.from(timeslotMap.entries()).map(
                  (
                    timeslotIdAndBookingIds: [number, BookingGetInterface[]]
                  ): [TimeslotGetInterface, BookingGetInterface[]] => {
                    const [timeslotId, bookings] = timeslotIdAndBookingIds;

                    const timeslot = remoteData.timeslots.get(timeslotId);

                    if (timeslot == null) {
                      throw new Error(
                        `Timeslot data (id: ${timeslotId}) not downloaded, even though it should be. This should never happen and is a programming error.`
                      );
                    }

                    return [timeslot, bookings];
                  }
                );

                timeslotBookingsArray.sort(
                  (
                    left: [TimeslotGetInterface, BookingGetInterface[]],
                    right: [TimeslotGetInterface, BookingGetInterface[]]
                  ) => {
                    const [leftTimeslot, _1] = left;
                    const [rightTimeslot, _2] = right;

                    return timeslotCompare(leftTimeslot, rightTimeslot);
                  }
                );

                return [weekday, timeslotBookingsArray];
              }
            );

            renderList.sort((left, right) => {
              const [leftWeekday, _1] = left;
              const [rightWeekday, _2] = right;

              return nameSorter(leftWeekday.name, rightWeekday.name);
            });

            return (
              <>
                {renderList.map((weekdayEntry) => {
                  const [weekday, timeslotsAndBookings] = weekdayEntry;

                  return (
                    <>
                      <Typography variant="h5">{weekday.name}</Typography>
                      <List>
                        {timeslotsAndBookings.map((timeslotEntry) => {
                          const [timeslot, bookings] = timeslotEntry;

                          return bookings.map((booking) => (
                            <ListItem key={booking.id}>
                              <ListItemText>
                                {timeslot.startHours}:{timeslot.startMinutes} -{' '}
                                {timeslot.endHours}:{timeslot.endMinutes}
                              </ListItemText>
                              <ListItemSecondaryAction>
                                <IconButton
                                  onClick={() => this.deleteBooking(booking.id)}
                                  edge="end"
                                  aria-label="delete"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ));
                        })}
                      </List>
                    </>
                  );
                })}
              </>
            );
          }}
        />
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const BookingsLookupView = withStyles(styles)(UnstyledBookingsLookupView);
export default BookingsLookupView;

interface Properties extends WithStyles<typeof styles> {
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
