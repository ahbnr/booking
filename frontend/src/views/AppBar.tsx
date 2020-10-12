import {
  AppBar as MaterialAppBar,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { createStyles, Theme } from '@material-ui/core/styles';
import { boundClass } from 'autobind-decorator';
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import {
  Authenticating,
  InteractionState,
  InvitingAdmin,
} from '../InteractionState';
import clsx from 'clsx';

const drawerWidth = 240;

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
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
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
    drawerPaper: {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: 0,
    },
  });

@boundClass
class UnstyledAppBar extends React.Component<Properties, State> {
  public static displayName = 'AppBar';

  constructor(props: Properties) {
    super(props);

    this.state = {
      drawerOpen: false,
    };
  }

  handleDrawerOpen() {
    this.setState({ drawerOpen: true });
  }

  handleDrawerClose() {
    this.setState({ drawerOpen: false });
  }

  login() {
    this.props.changeInteractionState(new Authenticating());
  }

  onAddAdminButton() {
    this.props.changeInteractionState(new InvitingAdmin());
  }

  render() {
    return (
      <>
        <MaterialAppBar
          position="absolute"
          className={clsx(
            this.props.classes.appBar,
            this.state.drawerOpen && this.props.classes.appBarShift
          )}
        >
          <Toolbar className={this.props.classes.toolbar}>
            {this.props.isAuthenticated && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={clsx(
                  this.props.classes.menuButton,
                  this.state.drawerOpen && this.props.classes.menuButtonHidden
                )}
              >
                <MenuIcon />
              </IconButton>
            )}
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
        {this.props.isAuthenticated && (
          <Drawer
            variant="permanent"
            classes={{
              paper: clsx(
                this.props.classes.drawerPaper,
                !this.state.drawerOpen && this.props.classes.drawerPaperClose
              ),
            }}
            open={this.state.drawerOpen}
          >
            <div className={this.props.classes.toolbarIcon}>
              <IconButton onClick={this.handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <List>
              <ListItem button onClick={this.onAddAdminButton}>
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Hinzufügen" />
              </ListItem>
            </List>
          </Drawer>
        )}
      </>
    );
  }
}

const AppBar = withStyles(styles)(UnstyledAppBar);

export default AppBar;

interface Properties extends WithStyles<typeof styles> {
  isAuthenticated: boolean;
  changeInteractionState: (interactionState: InteractionState) => unknown;
}

interface State {
  drawerOpen: boolean;
}
