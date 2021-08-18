import React, { ReactNode } from 'react';
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
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import { Alert } from '@material-ui/lab';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatarNormal: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    avatarAuthenticated: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.success.main,
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
class UnstyledConfirmBookingDialog extends React.PureComponent<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {};
  }

  handleOkButton() {
    window.history.back();
    window.history.back();
  }

  render() {
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
          <Typography variant="body1" className={this.props.classes.mainText}>
            Die Buchung wurde erfolgreich erstellt. Da Sie als Administrator
            angemeldet sind, ist keine Bestätigung der Buchung notwendig.
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
        </>
      );
    } else {
      content = (
        <>
          <Avatar className={this.props.classes.avatarNormal}>
            <TimelapseIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Buchung Bestätigen
          </Typography>
          <Typography variant="body1" className={this.props.classes.mainText}>
            Wir haben Ihnen eine E-Mail zugesandt. Bitte klicken Sie auf den
            Link in der E-Mail um Ihre Buchung zu bestätigen.
          </Typography>
          <Alert severity="warning">
            Ihre Buchung verfällt automatisch nach 10 Minuten, wenn sie nicht
            bestätigt wird!
          </Alert>
          <Button
            autoFocus
            variant="contained"
            color="primary"
            className={this.props.classes.okButton}
            onClick={this.handleOkButton}
          >
            Ok
          </Button>
        </>
      );
    }

    return (
      <>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={this.props.classes.paper}>{content}</div>
        </Container>
      </>
    );
  }
}

const ConfirmBookingDialog = withStyles(styles)(UnstyledConfirmBookingDialog);
export default ConfirmBookingDialog;

interface Properties extends WithStyles<typeof styles> {
  isAuthenticated: boolean;
}

interface State {}
