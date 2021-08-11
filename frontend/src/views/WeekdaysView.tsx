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
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { fabStyle } from '../styles/fab';
import { Client } from '../Client';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import ListEx from './ListEx';
import { UnstyledAddWeekdayDialog } from './AddWeekdayDialog';
import LoadingBackdrop from './LoadingBackdrop';
import DeleteConfirmer from './DeleteConfirmer';
import { DateTime } from 'luxon';

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

  async getBookableWeekdays(): Promise<WeekdayWithBookingConditions[]> {
    const weekdays = await this.props.client.getWeekdaysForResource(
      this.props.resource.name
    );

    const bookableWeekdays = await Promise.all(
      weekdays.map(async (weekday) => {
        const bookingConditions = await this.props.client.getWeekdayBookingConditions(
          weekday.id
        );

        return {
          weekday: weekday,
          earliestBookingDate: DateTime.fromISO(
            bookingConditions.earliestBookingDate
          ),
        };
      })
    );

    return _.sortBy(
      bookableWeekdays,
      (bookableWeekday) => bookableWeekday.earliestBookingDate
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

  viewTimeslots(weekday: WeekdayGetInterface, bookingDay: DateTime) {
    this.props.changeInteractionState('viewingTimeslots', {
      weekday,
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
            <>
              <ListEx
                notEmptyTitle={
                  this.props.client.isAuthenticated()
                    ? 'Wählen Sie den Wochentag aus welchen Sie bearbeiten möchten:'
                    : 'An welchem Wochentag möchten Sie buchen?'
                }
                emptyTitle="Keine Wochentage angelegt"
                emptyMessage={
                  this.props.client.isAuthenticated()
                    ? 'Es wurden noch keine Wochentage angelegt.'
                    : 'Es wurden noch keine Wochentage angelegt. Melden Sie sich als Administrator an und erstellen Sie einige Wochentage.'
                }
              >
                {weekdaysWithConditions.map(
                  ({ weekday, earliestBookingDate }) => (
                    <ListItem
                      button
                      key={weekday.name}
                      data-cy={'weekday-list-item'}
                    >
                      <ListItemText
                        className={this.props.classes.listItemText}
                        data-cy={`weekday-list-item-${weekday.name}`}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            this.viewTimeslots(weekday, earliestBookingDate)
                          }
                          data-cy={'weekday-button'}
                          className={this.props.classes.listButton}
                        >
                          {t(weekday.name)}
                          {' - '}
                          {earliestBookingDate
                            .setLocale('de-DE') // TODO: Make this dynamic
                            .toLocaleString()}
                        </Button>
                      </ListItemText>
                      {this.props.isAuthenticated && (
                        <ListItemSecondaryAction>
                          <DeleteConfirmer
                            name={`der Wochentag "${t(weekday.name)}"`}
                          >
                            <IconButton
                              edge="end"
                              aria-label="end"
                              onClick={() => this.deleteWeekday(weekday.id)}
                              data-cy={'weekday-delete-button'}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </DeleteConfirmer>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  )
                )}
              </ListEx>
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
            </>
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
  weekdays?: Promise<WeekdayWithBookingConditions[]>;
  backdropOpen: boolean;
}

interface WeekdayWithBookingConditions {
  weekday: WeekdayGetInterface;
  earliestBookingDate: DateTime;
}
