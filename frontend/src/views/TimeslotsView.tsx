import React from 'react';
import '../App.css';
import _ from '../utils/lodash-mixins';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import TimeslotView from './TimeslotView';
import { Client } from '../Client';
import {
  compare,
  noRefinementChecks,
  TimeslotGetInterface,
  TimeslotPostInterface,
  WeekdayGetInterface,
} from 'common/dist';
import { changeInteractionStateT } from '../App';
import {
  createStyles,
  List,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { fabStyle } from '../styles/fab';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import ListEx from './ListEx';
import LoadingBackdrop from './LoadingBackdrop';

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
class UnstyledTimeslotsView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      timeslots: undefined,
      backdropOpen: false,
    };
  }

  componentDidMount() {
    this.refreshTimeslots();
  }

  async addTimeslot() {
    const data: TimeslotPostInterface = noRefinementChecks<
      TimeslotPostInterface
    >({
      startHours: 0,
      startMinutes: 0,
      endHours: 0,
      endMinutes: 0,
      capacity: 1,
    });

    this.setState({
      backdropOpen: true,
    });
    await this.props.client.createTimeslot(this.props.weekday.id, data);
    this.setState({
      backdropOpen: false,
    });

    this.refreshTimeslots();
  }

  refreshTimeslots() {
    const timeslotsPromise = this.props.client.getTimeslots(
      this.props.weekday.id
    );

    this.setState({
      ...this.state,
      timeslots: timeslotsPromise,
    });
  }

  render() {
    return (
      <Suspense
        fallback={<LoadingScreen />}
        asyncAction={this.state.timeslots}
        content={(timeslots) => {
          const sortedTimeslots: TimeslotGetInterface[] = _.sortWith(
            timeslots,
            compare
          );

          return (
            <>
              <ListEx
                emptyTitle="Keine Timeslots angelegt"
                emptyMessage="Melden Sie sich als Administrator an und erstellen sie einige Timeslots."
              >
                {sortedTimeslots.map((timeslot, index) => (
                  <TimeslotView
                    key={timeslot.id}
                    index={index}
                    isAuthenticated={this.props.isAuthenticated}
                    client={this.props.client}
                    changeInteractionState={this.props.changeInteractionState}
                    timeslotId={timeslot.id}
                  />
                ))}
              </ListEx>

              {this.props.isAuthenticated && (
                <Fab
                  className={this.props.classes.fab}
                  variant="extended"
                  onClick={this.addTimeslot}
                >
                  <AddIcon className={this.props.classes.extendedIcon} />
                  Timeslot
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

const TimeslotsView = withStyles(styles)(UnstyledTimeslotsView);
export default TimeslotsView;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  isAuthenticated: boolean;
  weekday: WeekdayGetInterface;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  timeslots?: Promise<TimeslotGetInterface[]>;
  backdropOpen: boolean;
}
