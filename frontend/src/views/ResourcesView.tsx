import React, { ChangeEvent } from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { InteractionState, ViewingWeekdays } from '../InteractionState';
import { Client } from '../Client';
import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { ResourceGetInterface } from 'common/dist';

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
class UnstyledResourcesView extends React.Component<Properties, State> {
  public static readonly displayName = 'ResourcesView';

  constructor(props: Properties) {
    super(props);

    this.state = {
      resources: [],
      showAddResourceModal: false,
      newResourceName: '',
    };
  }

  async componentDidMount() {
    await this.refreshResources();
  }

  async refreshResources() {
    const resources = await this.props.client.getResources();

    this.setState({
      resources: resources,
    });
  }

  launchAddResourceModal() {
    this.setState({
      showAddResourceModal: true,
    });
  }

  closeAddResourceModal() {
    this.setState({
      showAddResourceModal: false,
    });
  }

  handleCloseAddResourceModal() {
    this.closeAddResourceModal();
  }

  async handleAcceptAddResourceModal() {
    this.closeAddResourceModal();

    await this.addResource(this.state.newResourceName);
    this.setState({
      newResourceName: '',
    });

    await this.refreshResources();
  }

  onNewResourceNameChange(
    change: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    this.setState({
      newResourceName: change.target.value,
    });
  }

  async addResource(resourceName: string) {
    await this.props.client.createResource(resourceName);

    await this.refreshResources();
  }

  async deleteResource(resourceName: string) {
    await this.props.client.deleteResource(resourceName);

    await this.refreshResources();
  }

  viewWeekdays(resource: ResourceGetInterface) {
    this.props.changeInteractionState(new ViewingWeekdays(resource));
  }

  render() {
    return (
      <>
        <List component="nav">
          {this.state.resources.map((resource) => (
            <ListItem
              button
              onClick={() => this.viewWeekdays(resource)}
              key={resource.name}
            >
              <ListItemText>{resource.name}</ListItemText>
              {this.props.isAuthenticated && (
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => this.deleteResource(resource.name)}
                    edge="end"
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
        {this.props.isAuthenticated && (
          <Fab variant="extended" onClick={this.launchAddResourceModal}>
            <AddIcon className={this.props.classes.extendedIcon} />
            Neue Resource
          </Fab>
        )}
        <Dialog
          open={this.state.showAddResourceModal}
          onClose={this.handleCloseAddResourceModal}
        >
          <DialogTitle id="form-dialog-title">Resource hinzufügen</DialogTitle>
          <DialogContent>
            <DialogContentText>TODO Beschreibung</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name der Resource"
              fullWidth
              value={this.state.newResourceName}
              onChange={this.onNewResourceNameChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseAddResourceModal} color="primary">
              Abbrechen
            </Button>
            <Button
              disabled={this.state.newResourceName.length <= 0}
              onClick={this.handleAcceptAddResourceModal}
              color="primary"
            >
              Hinzufügen
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

const ResourcesView = withStyles(styles)(UnstyledResourcesView);
export default ResourcesView;

interface Properties extends WithStyles<typeof styles> {
  isAuthenticated: boolean;
  client: Client;
  changeInteractionState: (interactionState: InteractionState) => unknown;
}

interface State {
  resources: ResourceGetInterface[];
  showAddResourceModal: boolean;
  newResourceName: string;
}
