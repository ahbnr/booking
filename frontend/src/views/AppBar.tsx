import {
  AppBar as MaterialAppBar,
  Button,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { createStyles, Theme } from '@material-ui/core/styles';
import { boundClass } from 'autobind-decorator';
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { Authenticating, InteractionState } from '../InteractionState';

const styles = (theme: Theme) =>
  createStyles({
    toolbar: {
      paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    menuButtonHidden: {
      display: 'none',
    },
    title: {
      flexGrow: 1,
    },
  });

@boundClass
class UnstyledAppBar extends React.Component<Properties, State> {
  public static displayName = 'AppBar';

  login() {
    this.props.changeInteractionState(new Authenticating());
  }

  render() {
    return (
      <MaterialAppBar position="absolute" className={this.props.classes.appBar}>
        <Toolbar className={this.props.classes.toolbar}>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={this.props.classes.title}
          >
            Timeslot Booking
          </Typography>
          {!this.props.isAuthenticated && (
            <Button color="inherit" onClick={this.login}>
              Login
            </Button>
          )}
        </Toolbar>
      </MaterialAppBar>
    );
  }
}

const AppBar = withStyles(styles)(UnstyledAppBar);

export default AppBar;

interface Properties extends WithStyles<typeof styles> {
  isAuthenticated: boolean;
  changeInteractionState: (interactionState: InteractionState) => unknown;
}

interface State {}
