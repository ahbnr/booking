import React from 'react';
import '../App.css';
import { nameSorter, Weekday, weekdayNames } from '../models/Weekday';
import {
  Button,
  ButtonGroup,
  ListGroup,
  Container,
  Row,
  Col,
  Modal,
} from 'react-bootstrap';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { InteractionState, ViewingTimeslots } from '../InteractionState';
import { Client } from '../Client';

@boundClass
class WeekdaysView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      weekdays: [],
      showAddWeekdayModal: false,
    };
  }

  async componentDidMount() {
    await this.refreshWeekdays();
  }

  async refreshWeekdays() {
    const weekdays = await Client.getWeekdays();

    this.setState({
      weekdays: weekdays,
    });
  }

  launchAddWeekdayModal() {
    this.setState({
      ...this.state,
      showAddWeekdayModal: true,
    });
  }

  closeAddWeekdayModal() {
    this.setState({
      ...this.state,
      showAddWeekdayModal: false,
    });
  }

  getCreatedWeekdayNames(): Set<string> {
    return new Set<string>(
      this.state.weekdays
        .map((weekday) => weekday.name)
        .filter((weekdayName) => weekdayNames.has(weekdayName))
    );
  }

  getMissingWeekdayNames(): Array<string> {
    const createdWeekdayNames = this.getCreatedWeekdayNames();

    return Array.from(weekdayNames)
      .filter((name) => !createdWeekdayNames.has(name))
      .sort(nameSorter);
  }

  haveAllWeekdaysBeenCreated() {
    return _.isEqual(weekdayNames, this.getCreatedWeekdayNames());
  }

  async addWeekday(weekdayName: string) {
    await Client.createWeekday(weekdayName);

    await this.refreshWeekdays();
  }

  async deleteWeekday(weekdayName: string) {
    await Client.deleteWeekday(weekdayName);

    await this.refreshWeekdays();
  }

  viewTimeslots(weekday: Weekday) {
    this.props.changeInteractionState(new ViewingTimeslots(weekday));
  }

  async openWeekday(name: string) {
    this.closeAddWeekdayModal();
    await this.addWeekday(name);
  }

  render() {
    return (
      <div className="WeekdaysView">
        <ListGroup className="Listing">
          {this.state.weekdays
            .sort((left, right) => nameSorter(left.name, right.name))
            .map((weekday) => (
              <ListGroup.Item
                action
                key={weekday.name}
                onClick={() => this.viewTimeslots(weekday)}
              >
                <Container>
                  <Row>
                    <Col style={{ textAlign: 'left' }}>{weekday.name}</Col>
                    <Col sm="auto">
                      <span className="pull-right">
                        <Button
                          variant="danger"
                          onClick={() => this.deleteWeekday(weekday.name)}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </Button>
                      </span>
                    </Col>
                  </Row>
                </Container>
              </ListGroup.Item>
            ))}
        </ListGroup>

        <ButtonGroup className="Listing">
          {!this.haveAllWeekdaysBeenCreated() && (
            <Button onClick={this.launchAddWeekdayModal}>
              <FontAwesomeIcon icon={faPlus} /> Wochentag hinzufügen
            </Button>
          )}
        </ButtonGroup>

        <Modal
          show={this.state.showAddWeekdayModal}
          onHide={this.closeAddWeekdayModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Welcher Tag soll angelegt werden?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ButtonGroup style={{ display: 'flex', flexWrap: 'wrap' }}>
              {this.getMissingWeekdayNames().map((name) => (
                <Button
                  key={name}
                  onClick={async () => await this.openWeekday(name)}
                >
                  {name}
                </Button>
              ))}
            </ButtonGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeAddWeekdayModal}>
              Abbrechen
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

interface Properties {
  changeInteractionState: (interactionState: InteractionState) => unknown;
}

interface State {
  weekdays: Weekday[];
  showAddWeekdayModal: boolean;
}

export default WeekdaysView;
