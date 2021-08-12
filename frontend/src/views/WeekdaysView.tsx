import React from 'react';
import '../App.css';
import { weekdayNames } from '../models/WeekdayUtils';
import _ from 'lodash';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { ResourceGetInterface, WeekdayGetInterface } from 'common/dist';
import { changeInteractionStateT } from '../App';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  Button,
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
import { UnstyledAddWeekdayDialog } from './AddWeekdayDialog';
import LoadingBackdrop from './LoadingBackdrop';
import { DateTime } from 'luxon';
import InfiniteWeekdaysList from './InfiniteWeekdaysList';
import DeleteConfirmer from './DeleteConfirmer';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  getValidBookingDays,
  WeekdayWithBookingDay,
} from '../complex_queries/getValidBookingDays';

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
      weekdays: undefined,
      backdropOpen: false,
    };
  }

  componentDidMount() {
    this.refreshWeekdays();
  }

  async getBookableWeekdays(): Promise<WeekdayWithBookingDay[]> {
    const weekdays = await this.props.client.getWeekdaysForResource(
      this.props.resource.name
    );

    return getValidBookingDays(
      weekdays,
      this.props.isAuthenticated,
      this.props.client
    );
  }

  refreshWeekdays() {
    this.setState({
      weekdays: this.getBookableWeekdays(),
    });
  }

  haveAllWeekdaysBeenCreated(weekdays: WeekdayGetInterface[]) {
    return _.isEqual(
      weekdayNames,
      UnstyledAddWeekdayDialog.getCreatedWeekdayNames(weekdays)
    );
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

  openAddWeekdayDialog(weekdays: WeekdayGetInterface[]) {
    this.props.changeInteractionState('addingWeekday', {
      existingWeekdays: weekdays,
      resource: this.props.resource,
    });
  }

  render() {
    const { t } = this.props;

    return (
      <Suspense
        asyncAction={this.state.weekdays}
        fallback={<LoadingScreen />}
        content={(weekdaysWithConditions) => {
          const weekdays = weekdaysWithConditions.map(({ weekday }) => weekday);

          return (
            <div style={{ width: '100%', height: '100%' }}>
              <div style={{ width: '100%', height: '100%' }}>
                <InfiniteWeekdaysList
                  weekdays={weekdaysWithConditions}
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
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              this.viewTimeslots(weekdayId, bookingDay)
                            }
                            className={this.props.classes.listButton}
                          >
                            {t(weekdayName)}
                            {' - '}
                            {bookingDay
                              .setLocale('de-DE') // TODO: Make this dynamic
                              .toLocaleString()}
                          </Button>
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
                !this.haveAllWeekdaysBeenCreated(weekdays) && (
                  <Fab
                    className={this.props.classes.fab}
                    variant="extended"
                    onClick={() => this.openAddWeekdayDialog(weekdays)}
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
  weekdays?: Promise<WeekdayWithBookingDay[]>;
  backdropOpen: boolean;
}
