import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Container,
  createStyles,
  CssBaseline,
  Theme,
  Typography,
  WithStyles,
} from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import SecurityIcon from '@material-ui/icons/Security';
import FrontendConfig from '../booking-frontend.config';

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
    },
    mainText: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    okButton: {
      margin: theme.spacing(3, 0, 2),
    },
  });

@boundClass
class UnstyledPrivacyNote extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {};
  }

  handleOkButton() {
    window.history.back();
  }

  render() {
    return (
      <>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={this.props.classes.paper}>
            <Avatar className={this.props.classes.avatar}>
              <SecurityIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Datenschutz
            </Typography>
            <Typography variant="body1" className={this.props.classes.mainText}>
              Welche Daten werden bei einer Anmeldung über Sie gespeichert?
              <ul>
                <li>Ihr Vorname und Nachname</li>
                <li>Ihre E-Mail Adresse</li>
                <li>Der Termin und die angemeldete Resource</li>
              </ul>
              Warum werden diese Daten gespeichert?
              <ul>
                <li>Zur Organisation Ihres Termins</li>
              </ul>
              Wie lange werden diese Daten gespeichert?
              <ul>
                <li>Bis zu einem Tag nach dem Termin</li>
                <li>Danach werden alle Daten automatisch gelöscht</li>
              </ul>
              {FrontendConfig.privacyInfo.entitiesWithDataAccess.length > 0 && (
                <>
                  Wer kann diese Daten einsehen?
                  <ul>
                    {FrontendConfig.privacyInfo.entitiesWithDataAccess.map(
                      (entity) => (
                        <li key={entity}>{entity}</li>
                      )
                    )}
                  </ul>
                </>
              )}
            </Typography>
            <Button
              autoFocus
              variant="contained"
              color="primary"
              className={this.props.classes.okButton}
              onClick={this.handleOkButton}
            >
              Ok
            </Button>
          </div>
        </Container>
      </>
    );
  }
}

const PrivacyNote = withStyles(styles)(UnstyledPrivacyNote);
export default PrivacyNote;

interface Properties extends WithStyles<typeof styles> {}

interface State {}
