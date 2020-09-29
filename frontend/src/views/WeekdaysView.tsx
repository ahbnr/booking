import React from 'react';
import '../App.css';
import {nameSorter, Weekday, weekdayNames, weekdayNameToISOWeekday} from "../models/Weekday";
import {Button, ButtonGroup, ListGroup, Container, Row, Col, Modal, DropdownButton, Dropdown} from 'react-bootstrap';
import {faPlus, faMinus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import _ from 'lodash';
import '../utils/map_extensions'

class WeekdaysView extends React.Component<Properties, State> {
    constructor(props: Properties) {
        super(props);

        this.launchAddWeekdayModal = this.launchAddWeekdayModal.bind(this);
        this.closeAddWeekdayModal = this.closeAddWeekdayModal.bind(this);
        this.haveAllWeekdaysBeenCreated = this.haveAllWeekdaysBeenCreated.bind(this);
        this.getCreatedWeekdayNames = this.getCreatedWeekdayNames.bind(this);
        this.getMissingWeekdayNames = this.getMissingWeekdayNames.bind(this);
        this.addWeekday = this.addWeekday.bind(this);
        this.deleteWeekday = this.deleteWeekday.bind(this);

        this.state = {
            showAddWeekdayModal: false
        }
    }

    launchAddWeekdayModal() {
        this.setState({
            ...this.state,
            showAddWeekdayModal: true
        })
    }

    closeAddWeekdayModal() {
        this.setState({
            ...this.state,
            showAddWeekdayModal: false
        })
    }

    getCreatedWeekdayNames(): Set<string> {
        return new Set<string>(
            this.props.weekdays
                .map(
                    weekday => weekday.name
                )
                .filter(
                    weekdayName => weekdayNames.has(weekdayName)
                )
        );
    }

    getMissingWeekdayNames(): Array<string> {
        const createdWeekdayNames = this.getCreatedWeekdayNames();

        return Array
            .from(weekdayNames)
            .filter(name => !createdWeekdayNames.has(name))
            .sort(nameSorter)
    }

    haveAllWeekdaysBeenCreated() {
        return _.isEqual(weekdayNames, this.getCreatedWeekdayNames());
    }

    async addWeekday(weekdayName: string) {
        await fetch(`http://localhost:3000/weekdays/${weekdayName}`, {
            method: 'POST',
            body: JSON.stringify({})
        });

        await this.props.refreshWeekdays();
    }

    async deleteWeekday(weekdayName: string) {
        await fetch(`http://localhost:3000/weekdays/${weekdayName}`, {
            method: 'DELETE',
            body: JSON.stringify({})
        });

        await this.props.refreshWeekdays();
    }

    render() {
        return (
            <div className="WeekdaysView">
                <ListGroup className="Listing">
                    {
                        this.props.weekdays
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
                        <Button onClick={this.launchAddWeekdayModal}>
                            <FontAwesomeIcon icon={faPlus}/> Wochentag hinzufügen
                        </Button>
                    }
                </ButtonGroup>

                <Modal show={this.state.showAddWeekdayModal} onHide={this.closeAddWeekdayModal}>
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
                                                this.closeAddWeekdayModal();
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
    refreshWeekdays: () => Promise<void>;
    weekdays: Weekday[];
}

interface State {
    showAddWeekdayModal: boolean
}

export default WeekdaysView;
