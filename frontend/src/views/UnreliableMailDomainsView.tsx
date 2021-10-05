import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Container,
  createStyles,
  TextField,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { Client } from '../Client';
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail';
import LoadingBackdrop from './LoadingBackdrop';
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
  });

@boundClass
class UnstyledUnreliableMailDomainsView extends React.PureComponent<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      unreliableMailDomains: '',
      backdropOpen: true,
    };
  }

  private async refreshUnreliableMailDomains() {
    this.setState({
      backdropOpen: true,
    });

    const unreliableMailDomains = await this.props.client.getAllUnreliableMailDomains();
    const stringified = unreliableMailDomains.join('\n');

    this.setState({
      backdropOpen: false,
      unreliableMailDomains: stringified,
    });
  }

  async componentDidMount() {
    await this.refreshUnreliableMailDomains();
  }

  private async handleAcceptNewUnreliableMailDomains() {
    this.setState({
      backdropOpen: true,
    });

    const unreliableMailDomains = this.state.unreliableMailDomains
      .split('\n')
      .map((unreliableMailDomain) => unreliableMailDomain.trim());

    await this.props.client.setUnreliableMailDomains(unreliableMailDomains);
    this.setState({
      backdropOpen: false,
    });

    await this.refreshUnreliableMailDomains();
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      unreliableMailDomains: event.target.value,
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
              <AlternateEmailIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Unzuverlässige Mail Domains
            </Typography>
            <Typography variant="body1">
              <p>
                Hier kann eine Liste von Domains gepflegt werden bei welchen die
                Zustellung von Mails unzuverlässig ist. Beispielsweise neigen
                Microsoft Mail server (outlook.com etc.) dazu, ohne Vorwarnung
                Mails zu filtern.
              </p>
              <p>
                Nutzer mit E-Mail Addressen bei den Domains auf dieser Liste
                wird ein Bestätigungs-PDF zusätzlich zur Bestätigungs-E-Mail
                angeboten.
              </p>
              Je Zeile eine Domain. Zeilen welche mit {'#'} beginnen werden
              ignoriert.
            </Typography>
            <TextField
              multiline
              margin="dense"
              id="domain"
              label="Domain"
              fullWidth
              value={this.state.unreliableMailDomains}
              onChange={this.handleChange}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={this.handleAcceptNewUnreliableMailDomains}
              color="primary"
            >
              Bestätigen
            </Button>
          </div>
        </Container>
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const UnreliableMailDomainsView = withTranslation()(
  withStyles(styles)(UnstyledUnreliableMailDomainsView)
);
export default UnreliableMailDomainsView;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  client: Client;
}

interface State {
  unreliableMailDomains: string;
  backdropOpen: boolean;
}
