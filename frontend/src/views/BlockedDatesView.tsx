import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Container,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import { Client } from '../Client';
import Suspense from './Suspense';
import LoadingScreen from './LoadingScreen';
import { DateTime } from 'luxon';
import EventBusyIcon from '@material-ui/icons/EventBusy';
import AddIcon from '@material-ui/icons/Add';
import LoadingBackdrop from './LoadingBackdrop';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import LuxonUtils from '@date-io/luxon';
import { fabStyle } from '../styles/fab';
import DeleteIcon from '@material-ui/icons/Delete';
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
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    fab: fabStyle(theme),
    listItemText: {
      textAlign: 'left',
    },
    list: {
      width: '100%',
    },
  });

@boundClass
class UnstyledBlockedDatesView extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      newDate: new Date(),
      showAddBlockedDateModal: false,
      backdropOpen: false,
      getBlockedDates: undefined,
    };
  }

  private refreshBlockedDates() {
    this.setState({
      getBlockedDates: this.props.client.getAllBlockedDates(),
    });
  }

  componentDidMount() {
    this.refreshBlockedDates();
  }

  private openAddBlockedDateModal() {
    this.setState({
      showAddBlockedDateModal: true,
    });
  }

  private closeAddBlockedDateModal() {
    this.setState({
      showAddBlockedDateModal: false,
    });
  }

  private handleCloseAddBlockedDateModal() {
    this.closeAddBlockedDateModal();
  }

  onNewDateChange(changeDate: MaterialUiPickersDate) {
    if (changeDate != null) {
      this.setState({
        newDate: changeDate.toJSDate(),
      });
    }
  }

  private async handleAcceptAddBlockedDateModal() {
    this.closeAddBlockedDateModal();

    if (this.state.newDate != null) {
      this.setState({
        backdropOpen: true,
      });
      await this.props.client.createBlockedDate(
        DateTime.fromJSDate(this.state.newDate)
      );
      this.setState({
        backdropOpen: false,
      });

      this.refreshBlockedDates();
    }
  }

  private async deleteBlockedDate(date: DateTime) {
    this.setState({
      backdropOpen: true,
    });
    await this.props.client.deleteBlockedDate(date);
    this.setState({
      backdropOpen: false,
    });

    this.refreshBlockedDates();
  }

  render() {
    return (
      <>
        <Suspense
          asyncAction={this.state.getBlockedDates}
          fallback={<LoadingScreen />}
          content={(blockedDates) => (
            <Container
              className={this.props.classes.container}
              component="main"
              maxWidth="xs"
            >
              <div className={this.props.classes.paper}>
                <Avatar className={this.props.classes.avatar}>
                  <EventBusyIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Gesperrte Tage
                </Typography>
                <Typography variant="body1">
                  {blockedDates.length > 0
                    ? 'Erlaube keine Buchungen an diesen Tagen:'
                    : 'Momentan werden keine Tage gesperrt.'}
                </Typography>
                <List className={this.props.classes.list}>
                  {blockedDates.map((blockedDate) => (
                    <ListItem key={blockedDate.toISODate()}>
                      <ListItemText className={this.props.classes.listItemText}>
                        {blockedDate
                          .setLocale('de-DE')
                          .toLocaleString({ ...DateTime.DATE_SHORT })}
                      </ListItemText>
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => this.deleteBlockedDate(blockedDate)}
                          edge="end"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </div>
              <Fab
                className={this.props.classes.fab}
                onClick={this.openAddBlockedDateModal}
              >
                <AddIcon />
              </Fab>
            </Container>
          )}
        />
        <Dialog
          open={this.state.showAddBlockedDateModal}
          onClose={this.handleCloseAddBlockedDateModal}
        >
          <DialogTitle id="form-dialog-title">
            Gesperrten Tag hinzufügen
          </DialogTitle>
          <DialogContent>
            <MuiPickersUtilsProvider utils={LuxonUtils} locale="de-DE">
              <form
                onSubmit={
                  this.state.newDate != null
                    ? (e) => {
                        e.preventDefault();
                        this.handleAcceptAddBlockedDateModal();
                      }
                    : undefined
                }
              >
                <DatePicker
                  required
                  margin="dense"
                  id="date"
                  label="Datum"
                  format="dd.MM.yyyy"
                  value={this.state.newDate}
                  onChange={this.onNewDateChange}
                  fullWidth
                  animateYearScrolling
                />
              </form>
            </MuiPickersUtilsProvider>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCloseAddBlockedDateModal}
              color="primary"
            >
              Abbrechen
            </Button>
            <Button
              disabled={this.state.newDate == null}
              onClick={this.handleAcceptAddBlockedDateModal}
              color="primary"
            >
              Hinzufügen
            </Button>
          </DialogActions>
        </Dialog>
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const BlockedDatesView = withTranslation()(
  withStyles(styles)(UnstyledBlockedDatesView)
);
export default BlockedDatesView;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  client: Client;
}

interface State {
  newDate: Date;
  showAddBlockedDateModal: boolean;
  backdropOpen: boolean;
  getBlockedDates: Promise<DateTime[]> | undefined;
}
