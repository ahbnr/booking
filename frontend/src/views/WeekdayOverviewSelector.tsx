import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { changeInteractionStateT } from '../App';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  Button,
  createStyles,
  ListItem,
  ListItemText,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { fabStyle } from '../styles/fab';
import { Client } from '../Client';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import LoadingBackdrop from './LoadingBackdrop';
import { DateTime } from 'luxon';
import {
  getValidBookingDays,
  WeekdayWithBookingDay,
} from '../complex_queries/getValidBookingDays';
import InfiniteWeekdaysList from './InfiniteWeekdaysList';

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
    fab: fabStyle(theme),
    dialogPaperFullWidth: {
      overflowY: 'visible',
    },
    dialogActionsRoot: {
      overflowY: 'visible',
    },
    listButton: {
      width: '90%',
    },
    listItemText: {
      textAlign: 'center',
    },
  });

@boundClass
class UnstyledWeekdayOverviewSelector extends React.PureComponent<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      backdropOpen: false,
    };
  }

  componentDidMount() {
    this.refreshRelevantWeekdays();
  }

  refreshRelevantWeekdays() {
    const bookingDays = this.fetchBookingDays();

    this.setState({
      bookingDays,
    });
  }

  async fetchBookingDays(): Promise<WeekdayWithBookingDay[]> {
    const weekdays = await this.props.client.getWeekdays();

    return getValidBookingDays(weekdays, true, this.props.client);
  }

  overviewWeekday(weekdayId: number, bookingDay: DateTime) {
    this.props.changeInteractionState('overviewingDay', {
      weekdayId,
      bookingDay,
    });
  }

  render() {
    const { t } = this.props;

    return (
      <Suspense
        asyncAction={this.state.bookingDays}
        fallback={<LoadingScreen />}
        content={(bookingDays) => (
          <div style={{ width: '100%', height: '100%' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <InfiniteWeekdaysList
                weekdays={bookingDays}
                notEmptyTitle="Zu welchem Tag möchten Sie eine Übersicht der Buchungen?"
                emptyTitle="Keine Tage angelegt"
                emptyMessage="Im System wurden keine Wochentage angelegt."
              >
                {(bookingOption, style) => (
                  <ListItem
                    button
                    key={`${
                      bookingOption.weekdayId
                    }-${bookingOption.bookingDay.toISODate()}`}
                    style={style}
                  >
                    <ListItemText className={this.props.classes.listItemText}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          this.overviewWeekday(
                            bookingOption.weekdayId,
                            bookingOption.bookingDay
                          )
                        }
                        className={this.props.classes.listButton}
                      >
                        {t(bookingOption.weekdayName)}{' '}
                        {bookingOption.bookingDay
                          .setLocale('de-DE') // TODO: Make this dynamic
                          .toLocaleString()}
                      </Button>
                    </ListItemText>
                  </ListItem>
                )}
              </InfiniteWeekdaysList>
            </div>
            <LoadingBackdrop open={this.state.backdropOpen} />
          </div>
        )}
      />
    );
  }
}

const WeekdayOverviewSelector = withTranslation()(
  withStyles(styles)(UnstyledWeekdayOverviewSelector)
);

export default WeekdayOverviewSelector;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  client: Client;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  bookingDays?: Promise<WeekdayWithBookingDay[]>;
  backdropOpen: boolean;
}
