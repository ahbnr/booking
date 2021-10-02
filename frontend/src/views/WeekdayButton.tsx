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
import { DateTime } from 'luxon';
import { WeekdayName } from 'common';
import DateChip from './DateChip';

const styles = (theme: Theme) =>
  createStyles({
    buttonDateAttribute: {
      marginLeft: theme.spacing(4),
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
        <DateChip
          date={this.props.bookingDay}
          className={this.props.classes.buttonDateAttribute}
        />
      </Button>
    );
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
}

interface State {}
