import React from 'react';
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
import { Client } from '../Client';
import withStyles from '@material-ui/core/styles/withStyles';
import GroupIcon from '@material-ui/icons/Group';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { changeInteractionStateT } from '../App';
import { DateTime } from 'luxon';
import { WithTranslation, withTranslation } from 'react-i18next';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
    },
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
    title: {
      textAlign: 'center',
    },
    subtitle: {
      paddingTop: theme.spacing(1),
      textAlign: 'center',
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
class UnstyledGroupQuestionDialog extends React.PureComponent<
  Properties,
  State
> {
  onYes() {
    this.props.changeInteractionState('enteringName', {
      resourceName: this.props.resourceName,
      timeslotId: this.props.timeslotId,
      timeslotCapacity: this.props.timeslotCapacity,
      numBookingsForSlot: this.props.numBookingsForSlot,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      bookingDay: this.props.bookingDay,
      isBookingGroup: true,
    });
  }

  onNo() {
    this.props.changeInteractionState('enteringName', {
      resourceName: this.props.resourceName,
      timeslotId: this.props.timeslotId,
      timeslotCapacity: this.props.timeslotCapacity,
      numBookingsForSlot: this.props.numBookingsForSlot,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      bookingDay: this.props.bookingDay,
      isBookingGroup: false,
    });
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
              <GroupIcon />
            </Avatar>
            <Typography
              className={this.props.classes.title}
              component="h1"
              variant="h5"
            >
              Einzel- oder Gruppenbuchung?
            </Typography>
            <Typography
              className={this.props.classes.subtitle}
              variant="subtitle1"
            >
              M??chten Sie den Zeitslot f??r mehrere Personen buchen?
              <br />
              Insgesamt sind{' '}
              {this.props.timeslotCapacity - this.props.numBookingsForSlot}{' '}
              Pl??tze f??r diesen Zeitslot frei.
            </Typography>

            <div className={this.props.classes.buttonField}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={this.onYes}
                startIcon={<PersonAddIcon />}
                className={this.props.classes.leadingButton}
              >
                Ja, f??r Gruppe buchen
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={this.onNo}
              >
                Nur f??r mich buchen
              </Button>
            </div>
          </div>
        </Container>
      </>
    );
  }
}

const GroupQuestionDialog = withTranslation()(
  withStyles(styles)(UnstyledGroupQuestionDialog)
);
export default GroupQuestionDialog;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  client: Client;
  resourceName: string;
  timeslotId: number;
  timeslotCapacity: number;
  numBookingsForSlot: number;
  startTime: DateTime;
  endTime: DateTime;
  bookingDay: DateTime;
  changeInteractionState: changeInteractionStateT;
  isAuthenticated: boolean;
}

interface State {
  backdropOpen: boolean;
}
