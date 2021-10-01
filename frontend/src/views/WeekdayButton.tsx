import React, { MouseEventHandler } from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  Button,
  createStyles,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { DateTime } from 'luxon';
import { WeekdayName } from 'common';
import DateChip from './DateChip';
import EventBusyIcon from '@material-ui/icons/EventBusy';

const styles = (theme: Theme) =>
  createStyles({
    buttonDateAttribute: {
      marginLeft: theme.spacing(4),
    },
    blockedWarningIcon: {
      color: '#ff9800',
      display: 'inline-flex',
      verticalAlign: 'middle',
    },
    blockedWarningContainer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    blockedWarning: {
      color: 'rgb(102, 60, 0)',
      backgroundColor: 'rgb(255, 244, 229)',
      width: '90%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'baseline',
      padding: theme.spacing(1),
      gap: theme.spacing(1),
    },
  });

@boundClass
class UnstyledWeekdayButton extends React.PureComponent<Properties, State> {
  render() {
    const { t } = this.props;

    if (this.props.isBlocked) {
      return (
        <div className={this.props.classes.blockedWarningContainer}>
          <Paper
            elevation={1}
            className={this.props.classes.blockedWarning}
            onClick={
              this.props.isAuthenticated ? this.props.onClick : undefined
            }
          >
            <div style={{ flexGrow: 0 }}>
              <EventBusyIcon
                className={this.props.classes.blockedWarningIcon}
              />
            </div>
            <div style={{ flexGrow: 1, textAlign: 'left' }}>
              <Typography variant="body2">
                Kein Terminangebot am{' '}
                {this.props.bookingDay
                  .setLocale('de-DE')
                  .toLocaleString({ ...DateTime.DATE_SHORT })}
                .
              </Typography>
            </div>
          </Paper>
        </div>
      );
    } else {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={this.props.onClick}
          className={this.props.className}
        >
          {t(this.props.weekdayName)}
          <br />
          <DateChip
            date={this.props.bookingDay}
            className={this.props.classes.buttonDateAttribute}
          />
        </Button>
      );
    }
  }
}

const WeekdayButton = withTranslation()(
  withStyles(styles)(UnstyledWeekdayButton)
);
export default WeekdayButton;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  isAuthenticated: boolean;
  weekdayName: WeekdayName;
  bookingDay: DateTime;
  className?: string;
  onClick: MouseEventHandler;
  isBlocked: boolean;
}

interface State {}
