import React from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { Client } from '../Client';
import {
  createStyles,
  List,
  ListItem,
  ListItemText,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import { BookingGetInterface } from 'common/dist';

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
              <ListItemText>{booking.name}</ListItemText>
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
  bookings: BookingGetInterface[];
}
