import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Box,
  createStyles,
  Tab,
  Tabs,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { Client } from '../Client';
import { TabContext, TabPanel } from '@material-ui/lab';
import MainSettingsView from './MainSettingsView';
import BlockedDatesView from './BlockedDatesView';

const styles = (theme: Theme) => createStyles({});

@boundClass
class UnstyledSettingsDialog extends React.PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      currentTab: 'main-settings',
    };
  }

  private onChangeTab(event: unknown, newTab: string) {
    this.setState({
      currentTab: newTab,
    });
  }

  render() {
    return (
      <TabContext value={this.state.currentTab}>
        <Box style={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={this.state.currentTab} onChange={this.onChangeTab}>
            <Tab label="Einstellungen" value="main-settings" />
            <Tab label="Gesperrte Tage" value="blocked-dates" />
          </Tabs>
        </Box>
        <TabPanel value="main-settings">
          <MainSettingsView client={this.props.client} />
        </TabPanel>
        <TabPanel value="blocked-dates">
          <BlockedDatesView client={this.props.client} />
        </TabPanel>
      </TabContext>
    );
  }
}

const SettingsDialog = withStyles(styles)(UnstyledSettingsDialog);
export default SettingsDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
}

interface State {
  currentTab: string;
}
