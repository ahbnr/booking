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
import TimelapseIcon from '@material-ui/icons/Timelapse';
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
class UnstyledConfirmBookingDialog extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {};
  }

  handleOkButton() {
    window.history.back();
    window.history.back();
  }

  render() {
    return (
      <>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={this.props.classes.paper}>
            <Avatar className={this.props.classes.avatar}>
              <TimelapseIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Buchung Bestätigen
            </Typography>
            <Typography variant="body1" className={this.props.classes.mainText}>
              Wir haben Ihnen eine E-Mail zugesandt. Bitte klicken Sie auf den
              Link in der E-Mail um Ihre Buchung zu bestätigen.
            </Typography>
            <Alert severity="info">
              Ihre Buchung verfällt automatisch nach 10 Minuten, wenn sie nicht
              bestätigt wird!
            </Alert>
            <Button
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

const ConfirmBookingDialog = withStyles(styles)(UnstyledConfirmBookingDialog);
export default ConfirmBookingDialog;

interface Properties extends WithStyles<typeof styles> {}

interface State {}
