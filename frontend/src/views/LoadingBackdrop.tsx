import {
  Backdrop,
  CircularProgress,
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import React from 'react';

const styles = (theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  });

class UnstyledLoadingBackdrop extends React.Component<Properties, State> {
  render() {
    return (
      <Backdrop className={this.props.classes.backdrop} open={this.props.open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }
}

const LoadingBackdrop = withStyles(styles)(UnstyledLoadingBackdrop);
export default LoadingBackdrop;

interface Properties extends WithStyles<typeof styles> {
  open: boolean;
}

interface State {}
