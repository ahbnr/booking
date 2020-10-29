import React from 'react';
import '../App.css';
import { boundClass } from 'autobind-decorator';
import {
  createStyles,
  Grid,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { Client } from '../Client';
import { BookingGetInterface } from 'common/dist';
import Suspense from './Suspense';
import Skeleton from '@material-ui/lab/Skeleton';

const styles = (theme: Theme) =>
  createStyles({
    skeletonStyle: {
      marginBottom: theme.spacing(1),
    },
  });

@boundClass
class UnstyledBookingView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      booking: undefined,
    };
  }

  componentDidMount() {
    this.refreshBooking();
  }

  refreshBooking() {
    const bookingPromise = this.props.client.getBooking(this.props.bookingId);

    this.setState({
      booking: bookingPromise,
    });
  }

  async onDelete(booking: BookingGetInterface) {
    await this.props.client.deleteBooking(booking.id);

    this.props.onDelete();
  }

  render() {
    return (
      <Suspense
        asyncAction={this.state.booking}
        fallback={
          <Skeleton
            className={this.props.classes.skeletonStyle}
            variant="rect"
            width="100%"
            height={100}
          />
        }
        content={(booking) => (
          <>
            <ListItem>
              <ListItemText>
                <Grid alignItems="center" container spacing={3}>
                  <Grid item xs={6}>
                    <TextField
                      label="Name"
                      value={booking.name}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="E-Mail"
                      value={booking.email}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </ListItemText>
              <ListItemSecondaryAction>
                <IconButton onClick={() => this.onDelete(booking)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </>
        )}
      />
    );
  }
}

const BookingView = withStyles(styles)(UnstyledBookingView);
export default BookingView;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  bookingId: number;
  onDelete: () => unknown;
}

interface State {
  booking?: Promise<BookingGetInterface>;
}
