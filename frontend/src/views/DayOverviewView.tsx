import React, { createRef } from 'react';
import { boundClass } from 'autobind-decorator';
import {
  CircularProgress,
  Container,
  createStyles,
  CssBaseline,
  Grid,
  GridSize,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { Client } from '../Client';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  BookingWithContextGetInterface,
  noRefinementChecks,
} from 'common/dist';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { DateTime } from 'luxon';
import { BookingIntervalIndexRequestData } from 'common/dist/typechecking/api/BookingIntervalIndexRequestData';
import _ from 'lodash';
import { changeInteractionStateT } from '../App';
import { fabStyle } from '../styles/fab';
import Suspense from './Suspense';

import { NonEmptyString } from 'common';
import ResourceBookingsOverview from './ResourceBookingsOverview';
import renderDayOverviewPDF from '../pdf-rendering/RenderDayOverviewPDF';
import { BlobProvider } from '@react-pdf/renderer';
import FileSpeedDial from './FileSpeedDial';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    fab: fabStyle(theme),
    header: {
      paddingBottom: theme.spacing(2),
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
class UnstyledDayOverviewView extends React.PureComponent<Properties, State> {
  private calendarRef = createRef<HTMLDivElement>();

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
        start: this.props.bookingDay.startOf('day').toISO(),
        end: this.props.bookingDay.endOf('day').toISO(),
      })
    );

    return {
      bookings: bookings,
    };
  }

  render() {
    const { t } = this.props;

    return (
      <Suspense
        asyncAction={this.state.downloadedData}
        fallback={<CircularProgress size="6vw" />}
        content={(downloadedData) => {
          const resourceGroupedBookings: ResourceGroupedBookings[] = _.chain(
            downloadedData.bookings
          )
            .groupBy((booking) => booking.resource.name)
            .map((bookingList) => {
              const booking = bookingList[0];

              return {
                resourceName: booking.resource.name,
                bookings: bookingList,
              };
            })
            .orderBy((group) => group.bookings.length, ['desc'])
            .value();

          let gridColumnSize: GridSize = 12;
          if (resourceGroupedBookings.length >= 4) {
            gridColumnSize = 3;
          } else if (resourceGroupedBookings.length === 3) {
            gridColumnSize = 4;
          } else if (resourceGroupedBookings.length === 2) {
            gridColumnSize = 6;
          }

          const weekdayLocaleTitle = t(this.props.bookingDay.weekdayLong);
          const dateLocaleTitle = this.props.bookingDay.toLocaleString({
            ...DateTime.DATE_SHORT,
            locale: 'de-DE',
          });

          return (
            <Container component="main">
              <CssBaseline />
              <div className={this.props.classes.paper}>
                <Typography
                  component="h5"
                  variant="h5"
                  align="center"
                  className={this.props.classes.header}
                >
                  Tagesübersicht - {weekdayLocaleTitle} - {dateLocaleTitle}
                </Typography>
                <Grid
                  container
                  spacing={3}
                  ref={this.calendarRef}
                  style={{
                    width: '100%',
                  }}
                >
                  {resourceGroupedBookings.map((group) => (
                    <Grid
                      item
                      xs={12}
                      md={gridColumnSize}
                      key={group.resourceName}
                    >
                      <ResourceBookingsOverview
                        resourceName={group.resourceName}
                        bookings={group.bookings}
                        day={this.props.bookingDay} // TODO: Rewrite all of this to work in day intervals
                        changeInteractionState={
                          this.props.changeInteractionState
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
                <BlobProvider
                  document={renderDayOverviewPDF(
                    weekdayLocaleTitle,
                    dateLocaleTitle,
                    resourceGroupedBookings
                  )}
                >
                  {({ blob, loading }) => (
                    <FileSpeedDial
                      filename={`${weekdayLocaleTitle}-${this.props.bookingDay.toISODate()}.pdf`}
                      title={'Tagesübersicht Buchungen'}
                      text={`Buchungen von ${weekdayLocaleTitle} ${this.props.bookingDay.toLocaleString(
                        {
                          ...DateTime.DATE_SHORT,
                          locale: 'de-DE',
                        }
                      )} als PDF`}
                      blob={blob}
                      loading={loading}
                    />
                  )}
                </BlobProvider>
              </div>
            </Container>
          );
        }}
      />
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
  weekdayId: number;
  bookingDay: DateTime;
}

interface State {
  downloadedData?: Promise<DownloadedData>;
}

interface DownloadedData {
  bookings: BookingWithContextGetInterface[];
}

export interface ResourceGroupedBookings {
  resourceName: NonEmptyString;
  bookings: BookingWithContextGetInterface[];
}
