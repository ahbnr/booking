import React, { ChangeEvent } from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { Client } from '../Client';
import {
  Avatar,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
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
      resources: [],
      showAddResourceModal: false,
      newResourceName: '',
      isLoading: true,
    };
  }

  async componentDidMount() {
    await this.refreshResources();
  }

  async refreshResources() {
    this.setState({
      isLoading: true,
      resources: [],
    });

    const resources = await this.props.client.getResources();

    this.setState({
      isLoading: false,
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
    this.props.changeInteractionState('viewingWeekdays', { resource });
  }

  render() {
    let content;
    if (this.state.resources.length > 0) {
      content = (
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
      );
    } else {
      content = (
        <div className={this.props.classes.paper}>
          <Avatar className={this.props.classes.avatar}>
            <MoodBadIcon className={this.props.classes.avatarIcon} />
          </Avatar>
          <Typography variant="h5">
            Es wurden keine Resourcen erstellt.
          </Typography>
          <Typography variant="body1">
            Melden Sie sich als Administrator an und verwenden Sie den Button
            unten rechts, um eine Resource zu erstellen.
          </Typography>
        </div>
      );
    }

    return (
      <LoadingScreen isLoading={this.state.isLoading}>
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
      </LoadingScreen>
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
  resources: ResourceGetInterface[];
  showAddResourceModal: boolean;
  newResourceName: string;
  isLoading: boolean;
}
