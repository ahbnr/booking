import React from 'react';
import '../App.css';
import { Button, ButtonGroup, ListGroup } from 'react-bootstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from '../utils/lodash-mixins';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import TimeslotView from './TimeslotView';
import { Client } from '../Client';
import { InteractionState } from '../InteractionState';
import {
  compare,
  noRefinementChecks,
  TimeslotGetInterface,
  TimeslotPostInterface,
  WeekdayGetInterface,
} from 'common/dist';
import { changeInteractionStateT } from '../App';

@boundClass
class TimeslotsView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      timeslots: [],
    };
  }

  async componentDidMount() {
    await this.refreshTimeslots();
  }

  async addTimeslot() {
    const data: TimeslotPostInterface = noRefinementChecks<
      TimeslotPostInterface
    >({
      startHours: 0,
      startMinutes: 0,
      endHours: 0,
      endMinutes: 0,
      capacity: 1,
    });

    await this.props.client.createTimeslot(this.props.weekday.id, data);

    await this.refreshTimeslots();
  }

  async refreshTimeslots() {
    const timeslots = await this.props.client.getTimeslots(
      this.props.weekday.id
    );

    this.setState({
      ...this.state,
      timeslots: timeslots,
    });
  }

  render() {
    const sortedTimeslots: TimeslotGetInterface[] = _.sortWith(
      this.state.timeslots,
      compare
    );

    return (
      <div className="TimeslotsView">
        <ListGroup className="Listing">
          {sortedTimeslots.map((timeslot) => (
            <ListGroup.Item key={timeslot.id}>
              <TimeslotView
                isAuthenticated={this.props.isAuthenticated}
                client={this.props.client}
                changeInteractionState={this.props.changeInteractionState}
                timeslotId={timeslot.id}
                onDelete={this.refreshTimeslots}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>

        {this.props.isAuthenticated && (
          <ButtonGroup className="Listing">
            <Button onClick={this.addTimeslot}>
              <FontAwesomeIcon icon={faPlus} /> Timeslot hinzufügen
            </Button>
          </ButtonGroup>
        )}
      </div>
    );
  }
}

interface Properties {
  client: Client;
  isAuthenticated: boolean;
  weekday: WeekdayGetInterface;
  changeInteractionState: changeInteractionStateT;
}

interface State {
  timeslots: TimeslotGetInterface[];
}

export default TimeslotsView;
