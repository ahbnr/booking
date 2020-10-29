import React, { ChangeEvent, createRef } from 'react';
import { boundClass } from 'autobind-decorator';
import {
  CircularProgress,
  Container,
  createStyles,
  CssBaseline,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';
import { Client } from '../Client';
import { InteractionState, ViewingResources } from '../InteractionState';
import {
  BookingGetInterface,
  BookingWithContextGetInterface,
  noRefinementChecks,
  ResourceGetInterface,
  TimeslotGetInterface,
  WeekdayGetInterface,
  WeekdayName,
} from 'common/dist';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Calendar,
  momentLocalizer,
  Event as CalendarEvent,
  ToolbarProps,
} from 'react-big-calendar';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import { DateTime, Interval } from 'luxon';
import { BookingIntervalIndexRequestData } from 'common/dist/typechecking/api/BookingIntervalIndexRequestData';
import _ from 'lodash';
import { changeInteractionStateT } from '../App';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { fabStyle } from '../styles/fab';
import Suspense from './Suspense';

const localizer = momentLocalizer(moment);

interface CalendarResource {
  resourceId: string;
  resourceTitle: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
class CalendarToolbar extends React.Component<
  ToolbarProps<CalendarEvent, CalendarResource>,
  unknown
> {
  render() {
    return <></>;
  }
}

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    fab: fabStyle(theme),
  });

@boundClass
class UnstyledDayOverviewView extends React.Component<Properties, State> {
  private calendarRef = createRef<HTMLDivElement>();

  private bookingsGroupToEvent(
    bookings: BookingWithContextGetInterface[]
  ): CalendarEvent {
    if (bookings.length < 1) {
      throw new Error('The bookings group may not be empty.');
    }

    const sampleBooking = bookings[0];

    const data = {
      title: bookings.map((booking) => booking.name).join(', '),
      start: DateTime.fromISO(sampleBooking.startDate).toJSDate(),
      end: DateTime.fromISO(sampleBooking.endDate).toJSDate(),
      resourceId: sampleBooking.resource.name,
    };

    return data as CalendarEvent;
  }

  private resourceToCalendarResource(
    resource: ResourceGetInterface
  ): { resourceId: string; resourceTitle: string } {
    return {
      resourceId: resource.name,
      resourceTitle: resource.name,
    };
  }

  constructor(props: Properties) {
    super(props);

    this.state = {
      downloadedData: undefined,
    };
  }

  componentDidMount() {
    this.refreshData();
  }

  refreshData() {
    this.setState({
      downloadedData: this.fetchData(),
    });
  }

  async fetchData(): Promise<DownloadedData> {
    const bookings = await this.props.client.getBookingsInInterval(
      noRefinementChecks<BookingIntervalIndexRequestData>({
        start: this.props.dateInterval.start.toISO(),
        end: this.props.dateInterval.end.toISO(),
      })
    );

    return {
      bookings: bookings,
    };
  }

  render() {
    const content = (
      <Suspense
        asyncAction={this.state.downloadedData}
        fallback={<CircularProgress size="6vw" />}
        content={(downloadedData) => {
          const groupedBookings = _.groupBy(
            downloadedData.bookings,
            (booking) => [booking.startDate, booking.endDate]
          );
          const events = _.map(groupedBookings, (group) =>
            this.bookingsGroupToEvent(group)
          );

          const resources = _.map(
            _.uniq(
              _.map(downloadedData.bookings, (booking) => booking.resource)
            ),
            this.resourceToCalendarResource
          );

          return (
            <>
              <div ref={this.calendarRef}>
                <Calendar
                  events={events}
                  components={{
                    toolbar: CalendarToolbar,
                  }}
                  localizer={localizer}
                  defaultView={'day'}
                  views={['day']}
                  step={60}
                  defaultDate={this.props.dateInterval.start.toJSDate()}
                  resources={resources}
                  resourceIdAccessor="resourceId"
                  resourceTitleAccessor="resourceTitle"
                />
              </div>
              <ReactToPrint
                trigger={() => (
                  <Fab className={this.props.classes.fab}>
                    <PrintIcon />
                  </Fab>
                )}
                content={() => this.calendarRef.current}
              />
            </>
          );
        }}
      />
    );

    return (
      <>
        <Container component="main">
          <CssBaseline />
          <div className={this.props.classes.paper}>
            <Typography component="h3" variant="h3">
              Tagesübersicht - {this.props.dateInterval.start.weekdayLong}
            </Typography>
            {content}
          </div>
        </Container>
      </>
    );
  }
}

const DayOverviewView = withStyles(styles)(UnstyledDayOverviewView);
export default DayOverviewView;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  isAuthenticated: boolean;
  changeInteractionState: changeInteractionStateT;
  dateInterval: Interval;
}

interface State {
  downloadedData?: Promise<DownloadedData>;
}

interface DownloadedData {
  bookings: BookingWithContextGetInterface[];
}
