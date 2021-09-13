import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Container,
  createStyles,
  CssBaseline,
  List,
  ListItemText,
  Theme,
  Typography,
  WithStyles,
} from '@material-ui/core';
import { Client } from '../Client';
import withStyles from '@material-ui/core/styles/withStyles';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import DoneIcon from '@material-ui/icons/Done';
import { changeInteractionStateT } from '../App';
import { DateTime } from 'luxon';
import { WithTranslation, withTranslation } from 'react-i18next';
import { NonEmptyString } from 'common';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    subtitle: {
      paddingTop: theme.spacing(1),
      textAlign: 'center',
    },
    list: {
      flexGrow: 1,
      width: '100%',
    },
    buttonField: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
      width: '100%',
    },
    leadingButton: {
      marginBottom: theme.spacing(2),
    },
  });

@boundClass
class UnstyledConfirmParticipantsDialog extends React.PureComponent<
  Properties,
  State
> {
  onAddPerson() {
    this.props.changeInteractionState('addingParticipant', {
      resourceName: this.props.resourceName,
      timeslotId: this.props.timeslotId,
      timeslotCapacity: this.props.timeslotCapacity,
      numBookingsForSlot: this.props.numBookingsForSlot,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      bookingDay: this.props.bookingDay,
      participantNames: this.props.participantNames,
      numHistoryToClearOnSubmit: this.props.numHistoryToClearOnSubmit + 1,
    });
  }

  onDone() {
    this.props.changeInteractionState('enteringEmail', {
      resourceName: this.props.resourceName,
      timeslotId: this.props.timeslotId,
      timeslotCapacity: this.props.timeslotCapacity,
      numBookingsForSlot: this.props.numBookingsForSlot,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      bookingDay: this.props.bookingDay,
      participantNames: this.props.participantNames,
      numHistoryToClearOnSubmit: this.props.numHistoryToClearOnSubmit + 1,
    });
  }

  render() {
    const additionalParticipantPossible =
      this.props.numBookingsForSlot + this.props.participantNames.length <
      this.props.timeslotCapacity;

    return (
      <>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={this.props.classes.paper}>
            <Avatar className={this.props.classes.avatar}>
              <PersonAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Teilnehmer Bestätigen
            </Typography>
            <Typography
              className={this.props.classes.subtitle}
              variant="subtitle1"
            >
              {additionalParticipantPossible ? (
                <>
                  Sind dies alle Teilnehmer, oder sollen weitere hinzugefügt
                  werden?
                  <br />
                  Insgesamt sind{' '}
                  {this.props.timeslotCapacity -
                    this.props.numBookingsForSlot}{' '}
                  Plätze für diesen Zeitslot frei.
                </>
              ) : (
                <>
                  Die maximal mögliche Anzahl Teilnehmer für diesen Zeitslot ist
                  erreicht.
                  <br />
                  Bitte bestätigen Sie die Teilnehmer:
                </>
              )}
            </Typography>

            <List className={this.props.classes.list}>
              {this.props.participantNames.map((participant) => (
                <ListItemText key={participant}>{participant}</ListItemText>
              ))}
            </List>

            <div className={this.props.classes.buttonField}>
              {additionalParticipantPossible && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={this.onAddPerson}
                  startIcon={<PersonAddIcon />}
                  className={this.props.classes.leadingButton}
                >
                  Person hinzufügen
                </Button>
              )}
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={this.onDone}
                startIcon={<DoneIcon />}
              >
                {additionalParticipantPossible ? 'Fertig' : 'Bestätigen'}
              </Button>
            </div>
          </div>
        </Container>
      </>
    );
  }
}

const ConfirmParticipantsDialog = withTranslation()(
  withStyles(styles)(UnstyledConfirmParticipantsDialog)
);
export default ConfirmParticipantsDialog;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  client: Client;
  resourceName: string;
  timeslotId: number;
  timeslotCapacity: number;
  numBookingsForSlot: number;
  participantNames: NonEmptyString[];
  startTime: DateTime;
  endTime: DateTime;
  bookingDay: DateTime;
  changeInteractionState: changeInteractionStateT;
  isAuthenticated: boolean;
  numHistoryToClearOnSubmit: number;
}

interface State {
  backdropOpen: boolean;
}
