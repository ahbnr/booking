import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import {
  Button,
  createStyles,
  Grid,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import { changeInteractionStateT } from '../App';
import Config from '../booking.config.json';

const styles = (theme: Theme) =>
  createStyles({
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
    startButton: {
      margin: theme.spacing(3, 0, 2),
    },
  });

@boundClass
class UnstyledMainView extends React.Component<Properties, State> {
  public static readonly displayName = 'MainView';

  constructor(props: Properties) {
    super(props);

    this.state = {};
  }

  openResources() {
    this.props.changeInteractionState('viewingResources', {});
  }

  render() {
    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '70vh' }}
      >
        <Typography variant="h5" align="center">
          Willkommen
        </Typography>
        <Typography variant="subtitle1" align="center">
          Im Buchungssystem der {Config.organization}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={this.props.classes.startButton}
          onClick={this.openResources}
        >
          Start
        </Button>
      </Grid>
    );
  }
}

const MainView = withStyles(styles)(UnstyledMainView);
export default MainView;

interface Properties extends WithStyles<typeof styles> {
  changeInteractionState: changeInteractionStateT;
}

interface State {}
