import {
  CircularProgress,
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import React from 'react';

const styles = (_theme: Theme) =>
  createStyles({
    progressContainer: {
      width: '100%',
      height: '80vh',
      display: 'flex',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    },
  });

class UnstyledLoadingScreen extends React.Component<Properties, State> {
  render() {
    if (this.props.isLoading == null || this.props.isLoading) {
      return (
        <div className={this.props.classes.progressContainer}>
          <CircularProgress size={'6vw'} />
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}

const LoadingScreen = withStyles(styles)(UnstyledLoadingScreen);
export default LoadingScreen;

interface Properties extends WithStyles<typeof styles> {
  isLoading?: boolean;
}

interface State {}
