import React, { MouseEventHandler } from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  Button,
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import { DateTime } from 'luxon';
import { WeekdayName } from 'common';

const styles = (theme: Theme) =>
  createStyles({
    buttonDateAttribute: {
      backgroundColor: theme.palette.secondary.light,
      borderRadius: '16px',
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      paddingTop: theme.spacing(0.3),
      paddingBottom: theme.spacing(0.3),
      display: 'flex',
      alignItems: 'center',
      marginLeft: theme.spacing(4),
    },
    buttonDateAttributeIcon: {
      height: theme.spacing(3),
      width: theme.spacing(3),
      marginRight: theme.spacing(1),
      color: theme.palette.getContrastText(theme.palette.secondary.light),
    },
  });

@boundClass
class UnstyledWeekdayButton extends React.PureComponent<Properties, State> {
  render() {
    const { t } = this.props;

    return (
      <Button
        variant="contained"
        color="primary"
        onClick={this.props.onClick}
        className={this.props.className}
      >
        {t(this.props.weekdayName)}
        <br />
        <div className={this.props.classes.buttonDateAttribute}>
          <EventIcon className={this.props.classes.buttonDateAttributeIcon} />
          {this.props.bookingDay
            .setLocale('de-DE') // TODO: Make this dynamic
            .toLocaleString({
              ...DateTime.DATE_SHORT,
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
            })}
        </div>
      </Button>
    );
  }
}

const WeekdayButton = withTranslation()(
  withStyles(styles)(UnstyledWeekdayButton)
);
export default WeekdayButton;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  weekdayName: WeekdayName;
  bookingDay: DateTime;
  className?: string;
  onClick: MouseEventHandler;
}

interface State {}
