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
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  IconButton,
  List,
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
import SplitButton from './SplitButton';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import ListEx from './ListEx';

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
  });

@boundClass
class UnstyledWeekdaysView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      weekdays: undefined,
      showAddWeekdayModal: false,
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

  launchAddWeekdayModal() {
    this.setState({
      ...this.state,
      showAddWeekdayModal: true,
    });
  }

  closeAddWeekdayModal() {
    this.setState({
      ...this.state,
      showAddWeekdayModal: false,
    });
  }

  getCreatedWeekdayNames(weekdays: WeekdayGetInterface[]): Set<string> {
    return new Set<string>(
      weekdays
        .map((weekday) => weekday.name)
        .filter((weekdayName) => weekdayNames.has(weekdayName))
    );
  }

  getMissingWeekdayNames(weekdays: WeekdayGetInterface[]): Array<string> {
    const createdWeekdayNames = this.getCreatedWeekdayNames(weekdays);

    return Array.from(weekdayNames)
      .filter((name) => !createdWeekdayNames.has(name))
      .sort(nameSorter);
  }

  haveAllWeekdaysBeenCreated(weekdays: WeekdayGetInterface[]) {
    return _.isEqual(weekdayNames, this.getCreatedWeekdayNames(weekdays));
  }

  async addWeekday(weekdayName: string) {
    await this.props.client.createWeekday(this.props.resource.name, {
      name: weekdayName as WeekdayName, // We trust here that the UI delivers the correct type. If not, the server performs checks and will reject it
    });

    this.refreshWeekdays();
  }

  async deleteWeekday(weekdayId: number) {
    await this.props.client.deleteWeekday(weekdayId);

    this.refreshWeekdays();
  }

  viewTimeslots(weekday: WeekdayGetInterface) {
    this.props.changeInteractionState('viewingTimeslots', { weekday });
  }

  async openWeekday(name: string) {
    this.closeAddWeekdayModal();
    await this.addWeekday(name);
  }

  render() {
    return (
      <Suspense
        asyncAction={this.state.weekdays}
        fallback={<LoadingScreen />}
        content={(weekdays) => (
          <>
            <ListEx
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
                        <IconButton
                          edge="end"
                          aria-label="end"
                          onClick={() => this.deleteWeekday(weekday.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
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
                  onClick={this.launchAddWeekdayModal}
                >
                  <AddIcon className={this.props.classes.extendedIcon} />
                  Wochentag
                </Fab>
              )}

            <Dialog
              open={this.state.showAddWeekdayModal}
              onClose={this.closeAddWeekdayModal}
            >
              <DialogTitle> Welcher Tag soll angelegt werden? </DialogTitle>
              <DialogContent>
                <DialogContentText>TODO Beschreibung</DialogContentText>
              </DialogContent>
              <DialogActions>
                <SplitButton
                  onClick={async (name, _) => await this.openWeekday(name)}
                  options={this.getMissingWeekdayNames(weekdays)}
                />
                <Button onClick={this.closeAddWeekdayModal} color="secondary">
                  Abbrechen
                </Button>
              </DialogActions>
            </Dialog>
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
  showAddWeekdayModal: boolean;
}
