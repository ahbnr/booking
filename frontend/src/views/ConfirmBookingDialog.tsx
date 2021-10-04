import React, { ReactNode } from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Container,
  createStyles,
  Theme,
  Typography,
  WithStyles,
} from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import TimelapseIcon from '@material-ui/icons/Timelapse';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import WarningIcon from '@material-ui/icons/Warning';
import GetAppIcon from '@material-ui/icons/GetApp';
import { Alert } from '@material-ui/lab';
import {
  BookingsCreateResponseInterface,
  NonEmptyString,
  SettingsGetInterface,
} from 'common';
import LoadingScreen from './LoadingScreen';
import Suspense from './Suspense';
import { Client } from '../Client';
import { changeInteractionStateT } from '../App';
import { DateTime } from 'luxon';
import getBaseUrl from '../utils/getBaseUrl';
import { saveAs } from 'file-saver';
import LoadingBackdrop from './LoadingBackdrop';
import DisplayableError from '../errors/DisplayableError';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatarNormal: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    avatarWarning: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.warning.main,
    },
    avatarError: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.error.main,
    },
    avatarAuthenticated: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.success.main,
    },
    mainText: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    firstButton: {
      margin: theme.spacing(3, 0, 2),
      width: '100%',
    },
    button: {
      width: '100%',
    },
  });

@boundClass
class UnstyledConfirmBookingDialog extends React.PureComponent<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = { settings: undefined, backdropOpen: false };
  }

  componentDidMount() {
    this.refreshSettings();
  }

  refreshSettings() {
    const settingsPromise = this.props.client.getSettings();

    this.setState({
      ...this.state,
      settings: settingsPromise,
    });
  }

  private handleOkButton() {
    this.props.changeInteractionState('viewingMainPage', {});
  }

  private reconfirmMailAddress() {
    this.props.changeInteractionState('enteringEmail', {
      resourceName: this.props.resourceName,
      timeslotId: this.props.timeslotId,
      timeslotCapacity: this.props.timeslotCapacity,
      numBookingsForSlot: this.props.numBookingsForSlot,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      bookingDay: this.props.bookingDay,
      participantNames: this.props.participantNames,
    });
  }

  private async downloadLookupPdf() {
    this.setState({
      backdropOpen: true,
    });

    const firstBooking = this.props.createResponse.bookings[0];
    const blob = await this.props.client.getLookupPdf(
      firstBooking.id,
      this.props.createResponse.lookupToken,
      `${getBaseUrl()}/`
    );

    saveAs(
      blob,
      `Buchungsbestätigung_${this.props.bookingDay
        .setLocale('de-DE')
        .toLocaleString({ ...DateTime.DATE_SHORT })}.pdf`
    );

    this.setState({
      backdropOpen: false,
    });
  }

  render() {
    return (
      <Suspense
        fallback={<LoadingScreen />}
        asyncAction={this.state.settings}
        content={(settings: SettingsGetInterface) => {
          let content: ReactNode;

          if (this.props.isAuthenticated) {
            content = (
              <>
                <Avatar className={this.props.classes.avatarAuthenticated}>
                  <ThumbUpIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Buchung Erstellt!
                </Typography>
                <Typography
                  variant="body1"
                  className={this.props.classes.mainText}
                >
                  Die Buchung wurde erfolgreich erstellt. Da Sie als
                  Administrator angemeldet sind, ist keine Bestätigung der
                  Buchung notwendig.
                </Typography>
                <Button
                  autoFocus
                  variant="contained"
                  color="primary"
                  className={this.props.classes.firstButton}
                  onClick={this.handleOkButton}
                >
                  Ok
                </Button>
              </>
            );
          } else {
            if (settings.requireMailConfirmation) {
              if (this.props.createResponse.status === 'mail_undeliverable') {
                // This code should actually be unreachable, since the booking process should already fail in the previous dialog
                throw new DisplayableError(
                  'Aus unbekannten Gründen konnte keine Bestätigungsmail zugestellt werden. Ihre Buchung wurde nicht vorgenommen. Versuchen Sie es später noch einmal.'
                );
              } else {
                content = (
                  <>
                    <>
                      <Avatar className={this.props.classes.avatarNormal}>
                        <TimelapseIcon />
                      </Avatar>
                      <Typography component="h1" variant="h5">
                        Buchung Bestätigen
                      </Typography>
                      <Typography
                        variant="body1"
                        className={this.props.classes.mainText}
                      >
                        Wir haben Ihnen eine E-Mail zugesandt. Bitte klicken Sie
                        auf den Link in der E-Mail um Ihre Buchung zu
                        bestätigen.
                      </Typography>
                      <Alert severity="warning">
                        Ihre Buchung verfällt automatisch nach 10 Minuten, wenn
                        sie nicht bestätigt wird! Prüfen Sie auch Ihren Spam
                        Ordner.
                      </Alert>
                    </>
                    <Button
                      autoFocus
                      variant="contained"
                      color="primary"
                      className={this.props.classes.firstButton}
                      onClick={this.handleOkButton}
                    >
                      Ok
                    </Button>
                  </>
                );
              }
            } else {
              if (this.props.createResponse.status === 'mail_undeliverable') {
                content = (
                  <>
                    <Avatar className={this.props.classes.avatarWarning}>
                      <WarningIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                      Mail Unzustellbar
                    </Typography>
                    <Alert severity="warning">
                      <p style={{ marginTop: '0px' }}>
                        Ihre Buchung wurde erstellt.
                        <br />
                        <span style={{ fontWeight: 'bold' }}>
                          Aber keine Bestätigungsmail konnte zugestellt werden!
                        </span>
                      </p>
                      Laden Sie also bitte stattdessen die Bestätigung Ihrer
                      Buchung als PDF Dokument herunter. Die Bestätigung enthält
                      auch Informationen wie Sie Ihre Buchung wieder absagen
                      können.
                    </Alert>
                    <Button
                      variant="contained"
                      color="secondary"
                      className={this.props.classes.firstButton}
                      onClick={this.downloadLookupPdf}
                      startIcon={<GetAppIcon />}
                    >
                      Bestätigung Herunterladen
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={this.handleOkButton}
                      className={this.props.classes.button}
                    >
                      Fertig
                    </Button>
                  </>
                );
              } else {
                content = (
                  <>
                    <Avatar className={this.props.classes.avatarAuthenticated}>
                      <ThumbUpIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                      Buchung Erstellt!
                    </Typography>
                    <Alert severity="success">
                      <p style={{ marginTop: '0px' }}>
                        Ihre Buchung wurde erstellt.
                      </p>
                      Wir haben Ihnen eine E-Mail zugesandt mit Informationen zu
                      Ihrem Buchungstermin. Die E-Mail enthält auch
                      Informationen wie Sie Ihre Buchung wieder absagen können.
                      Sehen Sie auch in Ihrem Spam Ordner nach.
                    </Alert>
                    <Button
                      autoFocus
                      variant="contained"
                      color="primary"
                      className={this.props.classes.firstButton}
                      onClick={this.handleOkButton}
                    >
                      Ok
                    </Button>
                  </>
                );
              }
            }
          }

          return (
            <>
              <Container
                className={this.props.classes.container}
                component="main"
                maxWidth="xs"
              >
                <div className={this.props.classes.paper}>{content}</div>
              </Container>
              <LoadingBackdrop open={this.state.backdropOpen} />
            </>
          );
        }}
      />
    );
  }
}

const ConfirmBookingDialog = withStyles(styles)(UnstyledConfirmBookingDialog);
export default ConfirmBookingDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  isAuthenticated: boolean;
  createResponse: BookingsCreateResponseInterface;
  changeInteractionState: changeInteractionStateT;
  mailAddress: string;
  resourceName: string;
  timeslotId: number;
  timeslotCapacity: number;
  numBookingsForSlot: number;
  startTime: DateTime;
  endTime: DateTime;
  bookingDay: DateTime;
  participantNames: NonEmptyString[];
}

interface State {
  settings?: Promise<SettingsGetInterface>;
  backdropOpen: boolean;
}
