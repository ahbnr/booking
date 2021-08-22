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

import Fab from '@material-ui/core/Fab';
import { fabStyle } from '../styles/fab';
import { saveAs } from 'file-saver';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import { detect } from 'detect-browser';
import Suspense from './Suspense';

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

    let chromeVersion: number | null = null;
    {
      const browser = detect();
      if (browser != null && browser.version != null) {
        const split = browser.version.split('.');
        if (split.length > 0) {
          const maybeChromeVersion = parseInt(split[0]);
          if (!isNaN(maybeChromeVersion)) {
            chromeVersion = maybeChromeVersion;
          }
        }
      }
    }

    return (
      navigator.share != null &&
      untypedNavigator.canShare != null &&
      untypedNavigator.canShare({ files: [file] }) &&
      (chromeVersion == null || chromeVersion >= 93) // chrome 92 contains a bug which makes web share fail for pdf files
    );
  }

  downloadFile(file: File) {
    saveAs(file, this.props.filename);
  }

  shareFile(file: File) {
    const untypedNavigator = navigator as any;

    untypedNavigator
      .share({
        //url: process.env.PUBLIC_URL,
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
    return (
      <Suspense
        asyncAction={this.props.blob}
        fallback={
          <Fab className={this.props.classes.fab}>
            <CircularProgress />
          </Fab>
        }
        content={(blob) => {
          const file = this.buildFile(blob);

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
        }}
      />
    );
  }
}

const FileSpeedDial = withTranslation()(
  withStyles(styles)(UnstyledFileSpeedDial)
);
export default FileSpeedDial;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  blob: Promise<Blob> | undefined;
  title: string;
  text: string;
  filename: string;
}

interface State {
  speedDialOpen: boolean;
}
