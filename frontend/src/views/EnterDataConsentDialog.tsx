import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Container,
  createStyles,
  Link,
  Theme,
  Typography,
  WithStyles,
} from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import { changeInteractionStateT } from '../App';
import { DateTime } from 'luxon';
import { WithTranslation, withTranslation } from 'react-i18next';
import {
  BookingsCreateInterface,
  ISO8601,
  NonEmptyString,
  noRefinementChecks,
} from 'common';
import PolicyIcon from '@material-ui/icons/Policy';
import getFrontendUrl from '../utils/getFrontendUrl';
import DisplayableError from '../errors/DisplayableError';
import LoadingBackdrop from './LoadingBackdrop';
import { Client } from '../Client';

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
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    subtitle: {
      paddingTop: theme.spacing(1),
      textAlign: 'center',
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  });

@boundClass
class UnstyledEnterDataConsentDialog extends React.PureComponent<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = { backdropOpen: false };
  }

  private showMoreDetails() {
    this.props.changeInteractionState('viewingPrivacyNote', {});
  }

  async onSubmit() {
    this.setState({
      backdropOpen: true,
    });

    try {
      const createResponse = await this.props.client.createBookings(
        this.props.timeslotId,
        {
          bookingDay: noRefinementChecks<ISO8601>(
            this.props.bookingDay.toISODate()
          ),
          participantNames: this.props.participantNames,
          email: this.props.mailAddress,
          lookupUrl: `${getFrontendUrl()}/`,
        }
      );

      this.props.changeInteractionState('confirmingBookingDialog', {
        createResponse,
        mailAddress: this.props.mailAddress,
        resourceName: this.props.resourceName,
        timeslotId: this.props.timeslotId,
        timeslotCapacity: this.props.timeslotCapacity,
        numBookingsForSlot: this.props.numBookingsForSlot,
        startTime: this.props.startTime,
        endTime: this.props.endTime,
        bookingDay: this.props.bookingDay,
        participantNames: this.props.participantNames,
      });
    } catch (e) {
      throw new DisplayableError(
        'Konnte Buchungen nicht erstellen. Eventuell hat jemand anderes den Platz inzwischen gebucht. Versuchen Sie einen anderen Zeitslot zu wählen.',
        e
      );
    }
  }

  render() {
    return (
      <>
        <Container
          className={this.props.classes.container}
          component="main"
          maxWidth="xs"
        >
          <div className={this.props.classes.paper}>
            <Avatar className={this.props.classes.avatar}>
              <PolicyIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Ihre Zustimmung
            </Typography>
            <Typography
              className={this.props.classes.subtitle}
              variant="subtitle1"
            >
              <p>
                Wir speichern Ihre Daten nur zur Organisation Ihres Termins und
                löschen Sie nach dem Termin wieder.
              </p>
              <p style={{ fontWeight: 'bold' }}>
                Stimmen Sie der Verarbeitung Ihrer Daten zu?
              </p>
              <p>
                Mehr Details gibt es{' '}
                <Link onClick={this.showMoreDetails}>hier.</Link>
              </p>
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              className={this.props.classes.submit}
              onClick={this.onSubmit}
            >
              {`Zustimmen`}
            </Button>
          </div>
        </Container>
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const EnterDataConsentDialog = withTranslation()(
  withStyles(styles)(UnstyledEnterDataConsentDialog)
);
export default EnterDataConsentDialog;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  client: Client;
  changeInteractionState: changeInteractionStateT;
  mailAddress: BookingsCreateInterface['email'];
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
  backdropOpen: boolean;
}
