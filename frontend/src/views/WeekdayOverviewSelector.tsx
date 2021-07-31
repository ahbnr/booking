import React from 'react';
import '../App.css';
import { nameSorter } from '../models/WeekdayUtils';
import _ from 'lodash';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { WeekdayName } from 'common/dist';
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
    dialogPaperFullWidth: {
      overflowY: 'visible',
    },
    dialogActionsRoot: {
      overflowY: 'visible',
    },
  });

@boundClass
class UnstyledWeekdayOverviewSelector extends React.Component<
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
    const weekdaysPromise = this.fetchRelevantWeekdays();

    this.setState({
      relevantWeekdays: weekdaysPromise,
    });
  }

  async fetchRelevantWeekdays(): Promise<WeekdayName[]> {
    const weekdays = await this.props.client.getWeekdays();

    return _.chain(weekdays)
      .map((weekday) => weekday.name)
      .uniq()
      .value();
  }

  overviewWeekday(weekdayName: WeekdayName) {
    this.props.changeInteractionState('overviewingDay', { weekdayName });
  }

  render() {
    const { t } = this.props;

    return (
      <Suspense
        asyncAction={this.state.relevantWeekdays}
        fallback={<LoadingScreen />}
        content={(relevantWeekdays) => (
          <>
            <ListEx
              notEmptyTitle="Zu welchem Tag möchten Sie eine Übersicht der Buchungen?"
              emptyTitle="Keine Tage angelegt"
              emptyMessage="Im System wurden keine Wochentage angelegt."
            >
              {relevantWeekdays.sort(nameSorter).map((weekdayName, index) => (
                <ListItem
                  button
                  key={index}
                  onClick={() => this.overviewWeekday(weekdayName)}
                >
                  <ListItemText> {t(weekdayName)} </ListItemText>
                </ListItem>
              ))}
            </ListEx>
            <LoadingBackdrop open={this.state.backdropOpen} />
          </>
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
  relevantWeekdays?: Promise<WeekdayName[]>;
  backdropOpen: boolean;
}
