import React from 'react';
import '../App.css';
import {nameSorter, Weekday, weekdayNames, weekdayNameToISOWeekday} from "../models/Weekday";
import {Button, ButtonGroup, ListGroup, Container, Row, Col, Modal, DropdownButton, Dropdown} from 'react-bootstrap';
import {faPlus, faMinus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import _ from 'lodash';
import '../utils/map_extensions'
import {Timeslot} from "../models/Timeslot";
import {boundClass} from "autobind-decorator";

@boundClass
class TimeslotsView extends React.Component<Properties, State> {
    constructor(props: Properties) {
        super(props);

        this.state = {
            timeslots: [],
            showAddTimeslotModal: false
        }
    }

    async componentDidMount() {
        const timeslotsResponse = await fetch(`http://localhost:3000/weekdays/${this.props.weekday.name}/timeslots`);
        const timeslots = await timeslotsResponse.json();

        this.setState({
            ...this.state,
            timeslots: timeslots
        })
    }

    launchAddTimeslotModal() {
        this.setState({
            ...this.state,
            showAddTimeslotModal: true
        })
    }

    closeAddTimeslotModal() {
        this.setState({
            ...this.state,
            showAddTimeslotModal: false
        })
    }

    async addTimeslot(
        startHours: number,
        startMinutes: number,
        endHours: number,
        endMinutes: number
    ) {
        await fetch(`http://localhost:3000/timeslots`, {
            method: 'POST',
            body: JSON.stringify({
                weekdayName: this.props.weekday.name,
                startHours: startHours,
                startMinutes: startMinutes,
                endHours: endHours,
                endMinutes: endMinutes,
            })
        });

        await this.refreshTimeslots();
    }

    async deleteTimeslot(timeslotId: number) {
        await fetch(`http://localhost:3000/timeslots/${timeslotId}`, {
            method: 'DELETE'
        });

        await this.refreshTimeslots();
    }

    async refreshTimeslots() {
        const timeslotsResponse = await fetch(`http://localhost:3000/weekdays/${this.props.weekday.name}/timeslots`);
        const timeslots = await timeslotsResponse.json();

        this.setState({
            ...this.state,
            timeslots: timeslots
        })
    }

    render() {
        _.chain(this.state.timeslots)
            .groupBy(timeslot => [timeslot.startHours, timeslot.startMinutes, timeslot.endHours, timeslot.endMinutes])
            .map(timeslotList => new TimeslotGroup)

        return (
            <div className="WeekdaysView">
                <ListGroup className="Listing">
                    {
                        this.state.timeslots
                            .sort((left, right) => nameSorter(left.name, right.name))
                            .map(weekday =>
                                <ListGroup.Item action>
                                    <Container>
                                        <Row>
                                            <Col style={{textAlign: 'left'}}>
                                                {weekday.name}
                                            </Col>
                                            <Col sm="auto">
                                            <span className="pull-right">
                                                <Button variant="danger" onClick={() => this.deleteWeekday(weekday.name)}>
                                                    <FontAwesomeIcon icon={faMinus}/>
                                                </Button>
                                            </span>
                                            </Col>
                                        </Row>
                                    </Container>
                                </ListGroup.Item>
                            )
                    }
                </ListGroup>

                <ButtonGroup className="Listing">
                    { !this.haveAllWeekdaysBeenCreated() &&
                        <Button onClick={this.launchAddTimeslotModal}>
                            <FontAwesomeIcon icon={faPlus}/> Wochentag hinzufügen
                        </Button>
                    }
                </ButtonGroup>

                <Modal show={this.state.showAddWeekdayModal} onHide={this.closeAddTimeslotModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Welcher Tag soll angelegt werden?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ButtonGroup style={{display: 'flex', flexWrap: 'wrap'}}>
                            {
                                this.getMissingWeekdayNames()
                                    .map(name =>
                                        <Button
                                            onClick={() => {
                                                this.closeAddTimeslotModal();
                                                this.addWeekday(name);
                                            }}
                                        >
                                            {name}
                                        </Button>
                                    )
                            }
                        </ButtonGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.closeAddTimeslotModal}>
                            Abbrechen
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

interface Properties {
    weekday: Weekday;
}

interface State {
    timeslots: Timeslot[];
    showAddTimeslotModal: boolean;
}

export default TimeslotsView;
