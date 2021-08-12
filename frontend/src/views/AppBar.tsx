import {
  AppBar as MaterialAppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Link,
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
import HomeIcon from '@material-ui/icons/Home';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import SettingsIcon from '@material-ui/icons/Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import clsx from 'clsx';
import DateRangeIcon from '@material-ui/icons/DateRange';
import { changeInteractionStateT } from '../App';
import { Client } from '../Client';
import FrontendConfig from '../booking-frontend.config';

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
    drawer: { flexShrink: 0 },
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
class UnstyledAppBar extends React.PureComponent<Properties, State> {
  public static displayName = 'AppBar';

  constructor(props: Properties) {
    super(props);

    this.state = {
      drawerOpen: false,
      logoutDialogOpen: false,
    };
  }

  handleDrawerOpen() {
    this.setState({ drawerOpen: true });
  }

  handleDrawerClose() {
    this.setState({ drawerOpen: false });
  }

  login() {
    this.props.changeInteractionState('authenticating', {});
  }

  onHomeButton() {
    this.props.changeInteractionState('viewingMainPage', {});
    this.handleDrawerClose();
  }

  onAddAdminButton() {
    this.props.changeInteractionState('invitingAdmin', {});
    this.handleDrawerClose();
  }

  onSettingsButton() {
    this.props.changeInteractionState('updatingSettings', {});
    this.handleDrawerClose();
  }

  onOverviewButton() {
    this.props.changeInteractionState('selectingWeekdayOverview', {});
    this.handleDrawerClose();
  }

  openLogoutDialog() {
    this.setState({
      logoutDialogOpen: true,
    });
  }

  handleLogoutDialogClose() {
    this.setState({
      logoutDialogOpen: false,
    });
  }

  handleLogout() {
    this.handleLogoutDialogClose();
    this.props.client.logout();
    this.props.changeInteractionState('viewingMainPage', {});
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
              <Link
                href="#"
                color="inherit"
                underline="none"
                onClick={() =>
                  this.props.changeInteractionState('viewingMainPage', {})
                }
              >
                {FrontendConfig.appBarTitle}
              </Link>
            </Typography>
            {!this.props.isAuthenticated && (
              <Button
                color="inherit"
                onClick={this.login}
                data-cy={'login-button'}
              >
                Login
              </Button>
            )}
            {this.props.isAuthenticated && (
              <AccountCircle
                data-cy="account-button"
                onClick={this.openLogoutDialog}
              />
            )}
          </Toolbar>
        </MaterialAppBar>
        {this.props.isAuthenticated && (
          <Drawer
            variant="temporary"
            className={this.props.classes.drawer}
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
              <ListItem button onClick={this.onHomeButton}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Hauptseite" />
              </ListItem>
              <ListItem button onClick={this.onAddAdminButton}>
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Hinzufügen" />
              </ListItem>
              <ListItem button onClick={this.onOverviewButton}>
                <ListItemIcon>
                  <DateRangeIcon />
                </ListItemIcon>
                <ListItemText primary="Tagesübersichten" />
              </ListItem>
              <ListItem button onClick={this.onSettingsButton}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Einstellungen" />
              </ListItem>
            </List>
          </Drawer>
        )}
        <Dialog
          open={this.state.logoutDialogOpen}
          onClose={this.handleLogoutDialogClose}
        >
          <DialogTitle>{'Ausloggen'}</DialogTitle>
          <DialogContent>
            <DialogContentText>Wollen Sie sich ausloggen?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleLogoutDialogClose}
              color="primary"
              autoFocus
            >
              Abbrechen
            </Button>
            <Button
              variant="contained"
              onClick={this.handleLogout}
              color="secondary"
            >
              Ausloggen
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

const AppBar = withStyles(styles)(UnstyledAppBar);

export default AppBar;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  isAuthenticated: boolean;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  drawerOpen: boolean;
  logoutDialogOpen: boolean;
}
