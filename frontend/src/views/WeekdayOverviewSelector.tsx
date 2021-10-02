import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { changeInteractionStateT } from '../App';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
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
  WeekdayBookingConstraint,
} from '../complex_queries/getValidBookingDays';
import InfiniteWeekdaysList from './InfiniteWeekdaysList';
import uniqBy from 'lodash/fp/uniqBy';
import WeekdayButton from './WeekdayButton';

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
    const weekdayConstraints = this.fetchWeekdayConstraints();

    this.setState({
      weekdayConstraints,
    });
  }

  async fetchWeekdayConstraints(): Promise<WeekdayBookingConstraint[]> {
    const weekdays = await this.props.client.getWeekdays();
    const deduplicatedWeekdays = uniqBy((weekday) => weekday.name, weekdays);

    return getValidBookingDays(deduplicatedWeekdays, true, this.props.client);
  }

  overviewWeekday(weekdayId: number, bookingDay: DateTime) {
    this.props.changeInteractionState('overviewingDay', {
      weekdayId,
      bookingDay,
    });
  }

  render() {
    return (
      <Suspense
        asyncAction={this.state.weekdayConstraints}
        fallback={<LoadingScreen />}
        content={(weekdayConstraints) => (
          <div style={{ width: '100%', height: '100%' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <InfiniteWeekdaysList
                weekdays={weekdayConstraints}
                maxWeekDistance={-1}
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
                      <WeekdayButton
                        isAuthenticated={true}
                        weekdayName={bookingOption.weekdayName}
                        bookingDay={bookingOption.bookingDay}
                        onClick={() =>
                          this.overviewWeekday(
                            bookingOption.weekdayId,
                            bookingOption.bookingDay
                          )
                        }
                        className={this.props.classes.listButton}
                      />
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
  weekdayConstraints?: Promise<WeekdayBookingConstraint[]>;
  backdropOpen: boolean;
}
