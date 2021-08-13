import React from 'react';
import '../App.css';
import { weekdayNames } from '../models/WeekdayUtils';
import _ from 'lodash';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { ResourceGetInterface } from 'common/dist';
import { changeInteractionStateT } from '../App';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  createStyles,
  Fab,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { fabStyle } from '../styles/fab';
import { Client } from '../Client';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import LoadingBackdrop from './LoadingBackdrop';
import { DateTime } from 'luxon';
import InfiniteWeekdaysList from './InfiniteWeekdaysList';
import DeleteConfirmer from './DeleteConfirmer';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  getValidBookingDays,
  WeekdayBookingConstraint,
} from '../complex_queries/getValidBookingDays';
import { SettingsGetInterface } from 'common/dist/typechecking/api/Settings';
import { WeekdayName } from 'common';
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
    listItemText: {
      textAlign: 'center',
    },
    listButton: {
      width: '90%',
    },
  });

@boundClass
class UnstyledWeekdaysView extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      remoteData: undefined,
      backdropOpen: false,
    };
  }

  componentDidMount() {
    this.refreshWeekdays();
  }

  async fetchRemoteData(): Promise<RemoteData> {
    const weekdays = await this.props.client.getWeekdaysForResource(
      this.props.resource.name
    );

    const weekdayConstraints = await getValidBookingDays(
      weekdays,
      this.props.isAuthenticated,
      this.props.client
    );

    const settings = await this.props.client.getSettings();

    return {
      weekdayConstraints,
      settings,
    };
  }

  refreshWeekdays() {
    this.setState({
      remoteData: this.fetchRemoteData(),
    });
  }

  haveAllWeekdaysBeenCreated(createdWeekdayNames: Set<WeekdayName>) {
    return _.isEqual(weekdayNames, createdWeekdayNames);
  }

  async deleteWeekday(weekdayId: number) {
    this.setState({
      backdropOpen: true,
    });
    await this.props.client.deleteWeekday(weekdayId);
    this.setState({
      backdropOpen: false,
    });

    this.refreshWeekdays();
  }

  viewTimeslots(weekdayId: number, bookingDay: DateTime) {
    this.props.changeInteractionState('viewingTimeslots', {
      weekdayId,
      bookingDay,
    });
  }

  openAddWeekdayDialog(existingWeekdayNames: Set<WeekdayName>) {
    this.props.changeInteractionState('addingWeekday', {
      existingWeekdayNames,
      resource: this.props.resource,
    });
  }

  render() {
    const { t } = this.props;

    return (
      <Suspense
        asyncAction={this.state.remoteData}
        fallback={<LoadingScreen />}
        content={({ weekdayConstraints, settings }) => {
          const createdWeekdayNames = new Set<WeekdayName>(
            _.chain(weekdayConstraints)
              .map(({ weekdayName }) => weekdayName)
              .value()
          );

          return (
            <div style={{ width: '100%', height: '100%' }}>
              <div style={{ width: '100%', height: '100%' }}>
                <InfiniteWeekdaysList
                  weekdays={weekdayConstraints}
                  maxWeekDistance={
                    this.props.isAuthenticated
                      ? -1
                      : settings.maxBookingWeekDistance
                  }
                  notEmptyTitle={
                    this.props.isAuthenticated
                      ? 'Wählen Sie den Wochentag aus welchen Sie bearbeiten möchten:'
                      : 'An welchem Wochentag möchten Sie buchen?'
                  }
                  emptyTitle={'Keine Wochentage angelegt'}
                  emptyMessage={
                    this.props.isAuthenticated
                      ? 'Es wurden noch keine Wochentage angelegt.'
                      : 'Es wurden noch keine Wochentage angelegt. Melden Sie sich als Administrator an und erstellen Sie einige Wochentage.'
                  }
                >
                  {(bookingOption, style) => {
                    const {
                      weekdayName,
                      weekdayId,
                      bookingDay,
                    } = bookingOption;

                    // Depending on whether there are secondary actions, we have to inject the style differently
                    const injectedStyle = this.props.isAuthenticated
                      ? {
                          ContainerComponent: 'div' as const,
                          ContainerProps: { style },
                        }
                      : { style: style };

                    return (
                      <ListItem
                        button
                        key={`${weekdayId}-${bookingDay.toISODate()}`}
                        data-cy={'weekday-list-item'}
                        {...injectedStyle}
                      >
                        <ListItemText
                          className={this.props.classes.listItemText}
                        >
                          <WeekdayButton
                            weekdayName={weekdayName}
                            bookingDay={bookingDay}
                            onClick={() =>
                              this.viewTimeslots(weekdayId, bookingDay)
                            }
                            className={this.props.classes.listButton}
                          />
                        </ListItemText>
                        {this.props.isAuthenticated && (
                          <ListItemSecondaryAction>
                            <DeleteConfirmer
                              name={`der Wochentag "${t(weekdayName)}"`}
                            >
                              <IconButton
                                edge="end"
                                aria-label="end"
                                onClick={() => this.deleteWeekday(weekdayId)}
                                data-cy={'weekday-delete-button'}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </DeleteConfirmer>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    );
                  }}
                </InfiniteWeekdaysList>
              </div>
              {this.props.isAuthenticated &&
                !this.haveAllWeekdaysBeenCreated(createdWeekdayNames) && (
                  <Fab
                    className={this.props.classes.fab}
                    variant="extended"
                    onClick={() =>
                      this.openAddWeekdayDialog(createdWeekdayNames)
                    }
                    data-cy={'add-weekday-button'}
                  >
                    <AddIcon className={this.props.classes.extendedIcon} />
                    Wochentag
                  </Fab>
                )}
              <LoadingBackdrop open={this.state.backdropOpen} />
            </div>
          );
        }}
      />
    );
  }
}

const WeekdaysView = withTranslation()(
  withStyles(styles)(UnstyledWeekdaysView)
);
export default WeekdaysView;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  resource: ResourceGetInterface;
  isAuthenticated: boolean;
  client: Client;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  remoteData?: Promise<RemoteData>;
  backdropOpen: boolean;
}

interface RemoteData {
  weekdayConstraints: WeekdayBookingConstraint[];
  settings: SettingsGetInterface;
}
