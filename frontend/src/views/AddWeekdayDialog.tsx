import React from 'react';
import { boundClass } from 'autobind-decorator';
import {
  Avatar,
  Button,
  Container,
  createStyles,
  CssBaseline,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import TodayIcon from '@material-ui/icons/Today';
import { Client } from '../Client';
import {
  ResourceGetInterface,
  WeekdayGetInterface,
  WeekdayName,
} from 'common/dist';
import { changeInteractionStateT } from '../App';
import { nameSorter, weekdayNames } from '../models/WeekdayUtils';
import LoadingBackdrop from './LoadingBackdrop';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    formControl: {
      margin: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  });

@boundClass
export class UnstyledAddWeekdayDialog extends React.Component<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      selectedWeekdayName: undefined,
      backdropOpen: false,
    };
  }

  async onSubmit() {
    if (this.state.selectedWeekdayName != null) {
      this.setState({
        backdropOpen: true,
      });
      await this.props.client.createWeekday(this.props.resource.name, {
        name: this.state.selectedWeekdayName as WeekdayName, // We trust here that the UI delivers the correct type. If not, the server performs checks and will reject it
      });

      window.history.back();
    }
  }

  onSelectedWeekdayNameChanged(
    changeEvent: React.ChangeEvent<{ name?: string; value: unknown }>
  ) {
    const selectedWeekdayName = changeEvent.target.value;

    if (typeof selectedWeekdayName === 'string') {
      this.setState({
        selectedWeekdayName,
      });
    }
  }

  public static getCreatedWeekdayNames(
    weekdays: WeekdayGetInterface[]
  ): Set<string> {
    return new Set<string>(
      weekdays
        .map((weekday) => weekday.name)
        .filter((weekdayName) => weekdayNames.has(weekdayName))
    );
  }

  static getMissingWeekdayNames(
    weekdays: WeekdayGetInterface[]
  ): Array<string> {
    const createdWeekdayNames = this.getCreatedWeekdayNames(weekdays);

    return Array.from(weekdayNames)
      .filter((name) => !createdWeekdayNames.has(name))
      .sort(nameSorter);
  }

  canBeSubmitted(): boolean {
    return (
      this.state.selectedWeekdayName != null &&
      this.state.selectedWeekdayName !== ''
    );
  }

  render() {
    const missingWeekdayNames = UnstyledAddWeekdayDialog.getMissingWeekdayNames(
      this.props.existingWeekdays
    );

    return (
      <>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={this.props.classes.paper}>
            <Avatar className={this.props.classes.avatar}>
              <TodayIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Anlegen eines Wochentags
            </Typography>
            <form className={this.props.classes.form} noValidate>
              <FormControl
                required
                fullWidth
                variant="outlined"
                margin="normal"
                className={this.props.classes.formControl}
              >
                <InputLabel id="weekday-name-select">
                  Wochentag auswählen
                </InputLabel>
                <Select
                  labelId="weekday-name-select"
                  value={this.state.selectedWeekdayName}
                  autoFocus
                  onChange={this.onSelectedWeekdayNameChanged}
                  label="Wochentag auswählen"
                  data-cy={'weekday-select'}
                >
                  <MenuItem value="">
                    <em>Nichts gewählt</em>
                  </MenuItem>
                  {missingWeekdayNames.map((weekdayName, index) => (
                    <MenuItem
                      key={index}
                      value={weekdayName}
                      data-cy={`weekday-select-option-${weekdayName}`}
                    >
                      {weekdayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={this.props.classes.submit}
                disabled={!this.canBeSubmitted()}
                onClick={this.onSubmit}
                data-cy={'add-weekday-confirm-button'}
              >
                Anlegen
              </Button>
            </form>
          </div>
        </Container>
        <LoadingBackdrop open={this.state.backdropOpen} />
      </>
    );
  }
}

const AddWeekdayDialog = withStyles(styles)(UnstyledAddWeekdayDialog);
export default AddWeekdayDialog;

interface Properties extends WithStyles<typeof styles> {
  client: Client;
  changeInteractionState: changeInteractionStateT;
  resource: ResourceGetInterface;
  existingWeekdays: WeekdayGetInterface[];
}

interface State {
  selectedWeekdayName?: string;
  backdropOpen: boolean;
}
