import React from 'react';
import '../App.css';
import { nameSorter, weekdayNames } from '../models/WeekdayUtils';
import _ from 'lodash';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import {
  ResourceGetInterface,
  WeekdayGetInterface,
  WeekdayName,
} from 'common/dist';
import { changeInteractionStateT } from '../App';
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
  });

@boundClass
class UnstyledWeekdaysView extends React.Component<Properties, State> {
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

  refreshWeekdays() {
    const weekdaysPromise = this.props.client.getWeekdays(
      this.props.resource.name
    );

    this.setState({
      weekdays: weekdaysPromise,
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

  viewTimeslots(weekday: WeekdayGetInterface) {
    this.props.changeInteractionState('viewingTimeslots', { weekday });
  }

  openAddWeekdayDialog(weekdays: WeekdayGetInterface[]) {
    this.props.changeInteractionState('addingWeekday', {
      existingWeekdays: weekdays,
      resource: this.props.resource,
    });
  }

  render() {
    return (
      <Suspense
        asyncAction={this.state.weekdays}
        fallback={<LoadingScreen />}
        content={(weekdays) => (
          <>
            <ListEx
              notEmptyTitle="An welchem Wochentag möchten Sie buchen?"
              emptyTitle="Keine Wochentage angelegt"
              emptyMessage="Es wurden noch keine Wochentage angelegt. Melden Sie sich als Administrator an und erstellen Sie einige Wochentage."
            >
              {weekdays
                .sort((left, right) => nameSorter(left.name, right.name))
                .map((weekday) => (
                  <ListItem
                    button
                    key={weekday.name}
                    onClick={() => this.viewTimeslots(weekday)}
                  >
                    <ListItemText> {weekday.name} </ListItemText>
                    {this.props.isAuthenticated && (
                      <ListItemSecondaryAction>
                        <DeleteConfirmer name={`der Wochentag ${weekday.name}`}>
                          <IconButton
                            edge="end"
                            aria-label="end"
                            onClick={() => this.deleteWeekday(weekday.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </DeleteConfirmer>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
            </ListEx>
            {this.props.isAuthenticated &&
              !this.haveAllWeekdaysBeenCreated(weekdays) && (
                <Fab
                  className={this.props.classes.fab}
                  variant="extended"
                  onClick={() => this.openAddWeekdayDialog(weekdays)}
                >
                  <AddIcon className={this.props.classes.extendedIcon} />
                  Wochentag
                </Fab>
              )}
            <LoadingBackdrop open={this.state.backdropOpen} />
          </>
        )}
      />
    );
  }
}

const WeekdaysView = withStyles(styles)(UnstyledWeekdaysView);
export default WeekdaysView;

interface Properties extends WithStyles<typeof styles> {
  resource: ResourceGetInterface;
  isAuthenticated: boolean;
  client: Client;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  weekdays?: Promise<WeekdayGetInterface[]>;
  backdropOpen: boolean;
}
