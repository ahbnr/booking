import {
  Avatar,
  Button,
  Container,
  createStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import PhoneIcon from '@material-ui/icons/Phone';
import React from 'react';
import DisplayableError from '../errors/DisplayableError';
import FrontendConfig from '../booking-frontend.config';

const styles = (theme: Theme) =>
  createStyles({
    progressContainer: {
      width: '100%',
      height: '80vh',
      display: 'flex',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
      width: theme.spacing(9),
      height: theme.spacing(9),
      marginBottom: theme.spacing(3),
    },
    avatarIcon: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  });

class UnstyledErrorView extends React.PureComponent<Properties, State> {
  render() {
    console.error(this.props.error);

    let content;
    if (this.props.error instanceof DisplayableError) {
      content = <>{this.props.error.message}</>;
    } else {
      content = <>Bitte versuchen Sie es später noch einmal.</>;
      if (this.props.error.message != null) {
        console.error(`Error with message: ${this.props.error.message}`);
        if (this.props.error.stack != null) {
          console.error(`Stack Trace:\n\n${this.props.error.stack}`);
        }
      }
    }

    let errorContacts;
    if (FrontendConfig.errorContacts.length > 0) {
      errorContacts = (
        <>
          <p>
            Wenn der Fehler weiterhin auftritt, erhalten Sie unter folgenden
            Kontakten Hilfe:
          </p>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                {FrontendConfig.errorContacts.map((contact) => (
                  <TableRow key={contact.name}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<PhoneIcon />}
                        href={`tel:${contact.phone}`}
                        color="primary"
                      >
                        {contact.phone}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      );
    }

    return (
      <Container component="main">
        <div className={this.props.classes.paper}>
          <Avatar className={this.props.classes.avatar}>
            <ErrorIcon className={this.props.classes.avatarIcon} />
          </Avatar>
          <Typography variant="h5">Ein Fehler ist Aufgetreten</Typography>
          <Typography variant="body1" component="p">
            {content}
          </Typography>
          {errorContacts && (
            <Typography variant="body1">{errorContacts}</Typography>
          )}
        </div>
      </Container>
    );
  }
}

const ErrorView = withStyles(styles)(UnstyledErrorView);
export default ErrorView;

interface Properties extends WithStyles<typeof styles> {
  error: Error;
}

interface State {}
