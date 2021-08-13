import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  CircularProgress,
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import ShareIcon from '@material-ui/icons/Share';
import GetAppIcon from '@material-ui/icons/GetApp';
import { withTranslation, WithTranslation } from 'react-i18next';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import Fab from '@material-ui/core/Fab';
import { fabStyle } from '../styles/fab';
import { saveAs } from 'file-saver';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';

const styles = (theme: Theme) =>
  createStyles({
    speedDial: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    fab: fabStyle(theme),
  });

@boundClass
class UnstyledFileSpeedDial extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = { speedDialOpen: false };
  }
  buildFile(blob: Blob): File {
    return new File([blob], this.props.filename, { type: blob.type });
  }

  canShare(file: File): boolean {
    const untypedNavigator = navigator as any;

    return (
      navigator.share != null &&
      untypedNavigator.canShare != null &&
      untypedNavigator.canShare({ files: [file] })
    );
  }

  downloadFile(file: File) {
    saveAs(file, this.props.filename);
  }

  shareFile(file: File) {
    const untypedNavigator = navigator as any;

    untypedNavigator
      .share({
        url: process.env.PUBLIC_URL,
        files: [file],
        title: this.props.title,
        text: this.props.text,
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  handleSpeedDialClick() {
    if (this.state.speedDialOpen) {
      this.setState({ speedDialOpen: false });
    } else {
      this.setState({ speedDialOpen: true });
    }
  }

  handleSpeedDialOpen() {
    this.setState({ speedDialOpen: true });
  }

  handleSpeedDialClose() {
    this.setState({ speedDialOpen: false });
  }

  handleDownload(file: File) {
    this.downloadFile(file);
    this.handleSpeedDialClose();
  }

  handleShare(file: File) {
    this.shareFile(file);
    this.handleSpeedDialClose();
  }

  render() {
    if (this.props.loading || this.props.blob == null) {
      return (
        <Fab className={this.props.classes.fab}>
          <CircularProgress />
        </Fab>
      );
    } else {
      const file = this.buildFile(this.props.blob);

      if (this.canShare(file)) {
        return (
          <SpeedDial
            ariaLabel=""
            className={this.props.classes.speedDial}
            icon={<ShareIcon />}
            onClose={this.handleSpeedDialOpen}
            onOpen={this.handleSpeedDialClose}
            onClick={this.handleSpeedDialClick}
            open={this.state.speedDialOpen}
          >
            <SpeedDialAction
              icon={<ShareIcon />}
              key={'share'}
              tooltipTitle={'Teilen'}
              tooltipOpen
              onClick={() => this.handleShare(file)}
            />
            <SpeedDialAction
              icon={<GetAppIcon />}
              key={'download'}
              tooltipTitle={'Download'}
              tooltipOpen
              onClick={() => this.handleDownload(file)}
            />
          </SpeedDial>
        );
      } else {
        return (
          <Fab
            className={this.props.classes.fab}
            onClick={() => this.handleDownload(file)}
          >
            <GetAppIcon />
          </Fab>
        );
      }
    }
  }
}

const FileSpeedDial = withTranslation()(
  withStyles(styles)(UnstyledFileSpeedDial)
);
export default FileSpeedDial;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  blob?: Blob | null;
  loading: boolean;
  title: string;
  text: string;
  filename: string;
}

interface State {
  speedDialOpen: boolean;
}
