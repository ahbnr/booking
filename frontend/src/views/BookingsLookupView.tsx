import React, { ChangeEvent } from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { InteractionState, ViewingWeekdays } from '../InteractionState';
import { Client } from '../Client';
import { Resource } from '../models/Resource';
import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { Booking } from '../models/Booking';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
  });

@boundClass
class UnstyledBookingsLookupView extends React.Component<Properties, State> {
  public static readonly displayName = 'BookingsLookupView';

  constructor(props: Properties) {
    super(props);

    this.state = {
      bookings: [],
    };
  }

  async componentDidMount() {
    await this.refresh();
  }

  async refresh() {
    this.setState({
      bookings: await this.props.client.getBookingsByToken(
        this.props.lookupToken
      ),
    });
  }

  render() {
    return (
      <>
        <List component="nav">
          {this.state.bookings.map((booking) => (
            <ListItem key={booking.id}>
              <ListItemText>{booking.data.name}</ListItemText>
            </ListItem>
          ))}
        </List>
      </>
    );
  }
}

const BookingsLookupView = withStyles(styles)(UnstyledBookingsLookupView);
export default BookingsLookupView;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  lookupToken: string;
}

interface State {
  bookings: Booking[];
}
