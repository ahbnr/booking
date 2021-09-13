import React from 'react';
import { boundClass } from 'autobind-decorator';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import { withTranslation, WithTranslation } from 'react-i18next';

import { DateTime } from 'luxon';
import EventIcon from '@material-ui/icons/Event';

const styles = (theme: Theme) =>
  createStyles({
    chip: {
      fontSize: '0.875rem',
      backgroundColor: theme.palette.secondary.light,
      borderRadius: '16px',
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      paddingTop: theme.spacing(0.3),
      paddingBottom: theme.spacing(0.3),
      display: 'inline-flex',
      alignItems: 'center',
      verticalAlign: 'middle',
      color: theme.palette.getContrastText(theme.palette.secondary.light),
    },
    chipIcon: {
      height: theme.spacing(3),
      width: theme.spacing(3),
      marginRight: theme.spacing(1),
      color: theme.palette.getContrastText(theme.palette.secondary.light),
    },
  });

@boundClass
class UnstyledDateChip extends React.PureComponent<Properties, State> {
  render() {
    return (
      <div
        className={`${this.props.classes.chip} ${this.props.className || ''}`}
      >
        <EventIcon className={this.props.classes.chipIcon} />
        {this.props.date
          .setLocale('de-DE') // TODO: Make this dynamic
          .toLocaleString({
            ...DateTime.DATE_SHORT,
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })}
      </div>
    );
  }
}

const DateChip = withTranslation()(withStyles(styles)(UnstyledDateChip));
export default DateChip;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  date: DateTime;
  className?: string;
}

interface State {}
