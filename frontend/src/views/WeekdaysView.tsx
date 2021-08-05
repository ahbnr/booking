import React from 'react';
import '../App.css';
import { nameSorter, weekdayNames } from '../models/WeekdayUtils';
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
import { getNextWeekdayDate } from 'common/dist/typechecking/api/Weekday';

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
    const weekdaysPromise = this.props.client.getWeekdaysForResource(
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
    const { t } = this.props;

    return (
      <Suspense
        asyncAction={this.state.weekdays}
        fallback={<LoadingScreen />}
        content={(weekdays) => (
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
              {weekdays
                .sort((left, right) => nameSorter(left.name, right.name))
                .map((weekday) => (
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
                        onClick={() => this.viewTimeslots(weekday)}
                        data-cy={'weekday-button'}
                        className={this.props.classes.listButton}
                      >
                        {t(weekday.name)}
                        {' - '}
                        {getNextWeekdayDate(weekday.name)
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
                ))}
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
        )}
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
  weekdays?: Promise<WeekdayGetInterface[]>;
  backdropOpen: boolean;
}
