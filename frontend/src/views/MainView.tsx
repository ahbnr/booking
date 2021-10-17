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
import FrontendConfig from '../booking-frontend.config';

import { withTranslation, WithTranslation } from 'react-i18next';
import { Alert } from '@material-ui/lab';

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
    welcomeHint: {
      marginTop: theme.spacing(2),
    },
  });

@boundClass
class UnstyledMainView extends React.PureComponent<Properties, State> {
  public static readonly displayName = 'MainView';

  constructor(props: Properties) {
    super(props);

    this.state = {};
  }

  openResources() {
    this.props.changeInteractionState('viewingResources', {});
  }

  viewPrivacyNote() {
    this.props.changeInteractionState('viewingPrivacyNote', {});
  }

  render() {
    const { t } = this.props;

    return (
      <>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: '70vh' }}
        >
          <React.Suspense fallback="Loading...">
            <Typography variant="h5" align="center">
              {t('welcome')}
            </Typography>
          </React.Suspense>
          <Typography variant="subtitle1" align="center">
            {t('welcome-subtitle')} {FrontendConfig.organization}
          </Typography>
          {FrontendConfig.welcomeHint && (
            <Alert severity="info" className={this.props.classes.welcomeHint}>
              {FrontendConfig.welcomeHint}
            </Alert>
          )}
          <Button
            variant="contained"
            color="primary"
            className={this.props.classes.startButton}
            onClick={this.openResources}
            data-cy={'start-button'}
          >
            {t('start-button')}
          </Button>
        </Grid>
      </>
    );
  }
}

const MainView = withTranslation()(withStyles(styles)(UnstyledMainView));
export default MainView;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  changeInteractionState: changeInteractionStateT;
}

interface State {}
