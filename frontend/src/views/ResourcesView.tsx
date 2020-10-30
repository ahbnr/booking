import React, { ChangeEvent } from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
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
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import { ResourceGetInterface } from 'common/dist';
import { changeInteractionStateT } from '../App';
import { fabStyle } from '../styles/fab';
import LoadingScreen from './LoadingScreen';
import Suspense from './Suspense';
import ListEx from './ListEx';
import LoadingBackdrop from './LoadingBackdrop';
import DeleteConfirmer from './DeleteConfirmer';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    paper: {
      marginTop: theme.spacing(8),
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
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
    fab: fabStyle(theme),
  });

@boundClass
class UnstyledResourcesView extends React.Component<Properties, State> {
  public static readonly displayName = 'ResourcesView';

  constructor(props: Properties) {
    super(props);

    this.state = {
      resources: undefined,
      showAddResourceModal: false,
      newResourceName: '',
      backdropOpen: false,
    };
  }

  componentDidMount() {
    this.refreshResources();
  }

  refreshResources() {
    const promise = this.props.client.getResources();
    this.setState({
      resources: promise,
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

    this.setState({
      backdropOpen: true,
    });
    await this.addResource(this.state.newResourceName);
    this.setState({
      newResourceName: '',
      backdropOpen: false,
    });

    this.refreshResources();
  }

  onNewResourceNameChange(
    change: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    this.setState({
      newResourceName: change.target.value,
    });
  }

  async addResource(resourceName: string) {
    this.setState({
      backdropOpen: true,
    });
    await this.props.client.createResource(resourceName);
    this.setState({
      backdropOpen: false,
    });

    this.refreshResources();
  }

  async deleteResource(resourceName: string) {
    this.setState({
      backdropOpen: true,
    });
    await this.props.client.deleteResource(resourceName);
    this.setState({
      backdropOpen: false,
    });

    this.refreshResources();
  }

  viewWeekdays(resource: ResourceGetInterface) {
    this.props.changeInteractionState('viewingWeekdays', { resource });
  }

  render() {
    const content = (
      <Suspense
        asyncAction={this.state.resources}
        fallback={<LoadingScreen />}
        content={(resources) => {
          return (
            <ListEx
              notEmptyTitle="Für welche Ressource möchten Sie buchen?"
              emptyTitle="Es wurden keine Resourcen erstellt."
              emptyMessage="Melden Sie sich als Administrator an und verwenden Sie den Button unten rechts, um eine Resource zu erstellen."
            >
              {resources.map((resource) => (
                <ListItem
                  button
                  onClick={() => this.viewWeekdays(resource)}
                  key={resource.name}
                >
                  <ListItemText>{resource.name}</ListItemText>
                  {this.props.isAuthenticated && (
                    <ListItemSecondaryAction>
                      <DeleteConfirmer name={`die Ressource ${resource.name}`}>
                        <IconButton
                          onClick={() => this.deleteResource(resource.name)}
                          edge="end"
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </DeleteConfirmer>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </ListEx>
          );
        }}
      />
    );

    return (
      <>
        {content}
        {this.props.isAuthenticated && (
          <Fab
            className={this.props.classes.fab}
            variant="extended"
            onClick={this.launchAddResourceModal}
          >
            <AddIcon className={this.props.classes.extendedIcon} />
            Resource
          </Fab>
        )}
        <Dialog
          open={this.state.showAddResourceModal}
          onClose={this.handleCloseAddResourceModal}
        >
          <DialogTitle id="form-dialog-title">Resource Hinzufügen</DialogTitle>
          <DialogContent>
            <form
              onSubmit={
                this.state.newResourceName.length > 0
                  ? (e) => {
                      e.preventDefault();
                      this.handleAcceptAddResourceModal();
                    }
                  : undefined
              }
            >
              <TextField
                autoFocus
                required
                margin="dense"
                id="name"
                label="Name der Resource"
                fullWidth
                value={this.state.newResourceName}
                onChange={this.onNewResourceNameChange}
              />
            </form>
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
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const ResourcesView = withStyles(styles)(UnstyledResourcesView);
export default ResourcesView;

interface Properties extends WithStyles<typeof styles> {
  isAuthenticated: boolean;
  client: Client;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  resources: Promise<ResourceGetInterface[]> | undefined;
  showAddResourceModal: boolean;
  newResourceName: string;
  backdropOpen: boolean;
}
