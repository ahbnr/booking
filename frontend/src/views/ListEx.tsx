import React from 'react';
import {
  Avatar,
  createStyles,
  List,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import MoodBadIcon from '@material-ui/icons/MoodBad';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
      width: theme.spacing(9),
      height: theme.spacing(9),
      marginBottom: theme.spacing(3),
    },
    avatarIcon: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  });

// eslint-disable-next-line @typescript-eslint/ban-types
class UnstyledInfoMessage extends React.Component<InfoMessageProperties, {}> {
  render() {
    return (
      <div className={this.props.classes.paper}>
        <Avatar className={this.props.classes.avatar}>
          <MoodBadIcon className={this.props.classes.avatarIcon} />
        </Avatar>
        <Typography variant="h5">
          {this.props.emptyTitle == null
            ? 'Keine Elemente'
            : this.props.emptyTitle}
        </Typography>
        <Typography variant="body1">
          {this.props.emptyTitle == null
            ? 'Diese Liste ist leer.'
            : this.props.emptyMessage}
        </Typography>
      </div>
    );
  }
}
const InfoMessage = withStyles(styles)(UnstyledInfoMessage);

/**
 * Same as <List> but displays a message if the list is empty.
 */
export default class ListEx extends React.Component<Properties, State> {
  render() {
    const { emptyTitle, emptyMessage, children, ...listProps } = this.props;

    if (children == null || React.Children.count(children) < 1) {
      return (
        <InfoMessage emptyTitle={emptyTitle} emptyMessage={emptyMessage} />
      );
    } else {
      return <List {...listProps}>{children}</List>;
    }
  }
}

type ListProps = React.ComponentProps<typeof List>;

interface InfoMessageProperties extends WithStyles<typeof styles> {
  emptyTitle?: string;
  emptyMessage?: string;
}

interface Properties extends ListProps {
  emptyTitle?: string;
  emptyMessage?: string;
}

interface State {}
