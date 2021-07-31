import React, { createRef } from 'react';
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
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  bookingCompare,
  BookingWithContextGetInterface,
  noRefinementChecks,
  ResourceGetInterface,
} from 'common/dist';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Calendar,
  Event as CalendarEvent,
  ToolbarProps,
  dateFnsLocalizer,
} from 'react-big-calendar';
import ReactToPrint from 'react-to-print';
import { DateTime, Interval } from 'luxon';
import { BookingIntervalIndexRequestData } from 'common/dist/typechecking/api/BookingIntervalIndexRequestData';
import _ from 'lodash';
import { changeInteractionStateT } from '../App';
import Fab from '@material-ui/core/Fab';
import { fabStyle } from '../styles/fab';
import Suspense from './Suspense';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import de from 'date-fns/locale/de';

const locales = {
  'de-DE': de,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    fab: fabStyle(theme),
    header: {
      marginBottom: theme.spacing(2),
    },
    calendar: {
      '& .rbc-allday-cell': {
        display: 'none',
      },
      '& .rbc-time-view .rbc-header': {
        borderBottom: 'none',
      },
    },
  });

@boundClass
class UnstyledDayOverviewView extends React.Component<Properties, State> {
  private calendarRef = createRef<HTMLDivElement>();

  private static bookingsGroupToEvent(
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

  private static resourceToCalendarResource(
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
    const { t } = this.props;

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
            UnstyledDayOverviewView.bookingsGroupToEvent(group)
          );

          const resources = _.map(
            _.uniqBy(
              _.map(downloadedData.bookings, (booking) => booking.resource),
              (resource) => resource.name
            ),
            UnstyledDayOverviewView.resourceToCalendarResource
          );

          const sortedBookings = downloadedData.bookings.sort(bookingCompare);
          const firstTime =
            sortedBookings.length > 0
              ? DateTime.fromISO(sortedBookings[0].startDate).toJSDate()
              : undefined;

          return (
            <>
              <div ref={this.calendarRef} style={{ width: '100%' }}>
                <Calendar
                  events={events}
                  components={{
                    toolbar: CalendarToolbar,
                  }}
                  localizer={localizer}
                  defaultView={'day'}
                  views={['day']}
                  defaultDate={this.props.dateInterval.start.toJSDate()}
                  resources={resources}
                  resourceIdAccessor="resourceId"
                  resourceTitleAccessor="resourceTitle"
                  style={{ minWidth: '100%' }}
                  className={this.props.classes.calendar}
                  scrollToTime={firstTime}
                  culture="de-DE"
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
            <Typography
              component="h5"
              variant="h5"
              align="center"
              className={this.props.classes.header}
            >
              Tagesübersicht - {t(this.props.dateInterval.start.weekdayLong)}
            </Typography>
            {content}
          </div>
        </Container>
      </>
    );
  }
}

const DayOverviewView = withTranslation()(
  withStyles(styles)(UnstyledDayOverviewView)
);
export default DayOverviewView;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
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
