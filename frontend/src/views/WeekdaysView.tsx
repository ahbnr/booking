import React from 'react';
import '../App.css';
import { nameSorter, weekdayNames } from '../models/WeekdayUtils';
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
import {
  ResourceGetInterface,
  WeekdayGetInterface,
  WeekdayName,
} from 'common/dist';

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
    const weekdays = await this.props.client.getWeekdays(
      this.props.resource.name
    );

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
    await this.props.client.createWeekday(this.props.resource.name, {
      name: weekdayName as WeekdayName, // We trust here that the UI delivers the correct type. If not, the server performs checks and will reject it
    });

    await this.refreshWeekdays();
  }

  async deleteWeekday(weekdayId: number) {
    await this.props.client.deleteWeekday(weekdayId);

    await this.refreshWeekdays();
  }

  viewTimeslots(weekday: WeekdayGetInterface) {
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
                        {this.props.isAuthenticated && (
                          <Button
                            variant="danger"
                            onClick={() => this.deleteWeekday(weekday.id)}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </Button>
                        )}
                      </span>
                    </Col>
                  </Row>
                </Container>
              </ListGroup.Item>
            ))}
        </ListGroup>

        {this.props.isAuthenticated && (
          <ButtonGroup className="Listing">
            {!this.haveAllWeekdaysBeenCreated() && (
              <Button onClick={this.launchAddWeekdayModal}>
                <FontAwesomeIcon icon={faPlus} /> Wochentag hinzufügen
              </Button>
            )}
          </ButtonGroup>
        )}

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
  resource: ResourceGetInterface;
  isAuthenticated: boolean;
  client: Client;
  changeInteractionState: (interactionState: InteractionState) => unknown;
}

interface State {
  weekdays: WeekdayGetInterface[];
  showAddWeekdayModal: boolean;
}

export default WeekdaysView;
