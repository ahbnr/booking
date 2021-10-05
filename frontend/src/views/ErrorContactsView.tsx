import {
  Button,
  createStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import PhoneIcon from '@material-ui/icons/Phone';
import React from 'react';
import FrontendConfig from '../booking-frontend.config';
import { boundClass } from 'autobind-decorator';

const styles = (theme: Theme) => createStyles({});

@boundClass
class UnstyledErrorContactsView extends React.PureComponent<Properties, State> {
  render() {
    if (
      FrontendConfig.errorContacts == null ||
      FrontendConfig.errorContacts.length === 0
    ) {
      return <></>;
    }

    return (
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
    );
  }
}

const ErrorContactsView = withStyles(styles)(UnstyledErrorContactsView);
export default ErrorContactsView;

interface Properties extends WithStyles<typeof styles> {}

interface State {}
