import {
  Avatar,
  createStyles,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import React from 'react';
import DisplayableError from '../errors/DisplayableError';

const styles = (theme: Theme) =>
  createStyles({
    progressContainer: {
      width: '100%',
      height: '80vh',
      display: 'flex',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    },
    paper: {
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

class UnstyledErrorView extends React.Component<Properties, State> {
  render() {
    let content;
    if (this.props.error instanceof DisplayableError) {
      content = <>{this.props.error.message}</>;
    } else {
      content = <>Ein unbekannter Fehler ist aufgetreten.</>;
    }

    return (
      <div className={this.props.classes.paper}>
        <Avatar className={this.props.classes.avatar}>
          <ErrorIcon className={this.props.classes.avatarIcon} />
        </Avatar>
        <Typography variant="h5">Ein Fehler ist Aufgetreten</Typography>
        <Typography variant="body1">{content}</Typography>
      </div>
    );
  }
}

const ErrorView = withStyles(styles)(UnstyledErrorView);
export default ErrorView;

interface Properties extends WithStyles<typeof styles> {
  error: Error;
}

interface State {}
