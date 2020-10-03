import React from 'react';
import '../App.css';
import {Weekday} from "../models/Weekday";
import {Button, ButtonGroup, ListGroup, Modal} from 'react-bootstrap';
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import _ from '../utils/lodash-mixins';
import '../utils/map_extensions'
import {compare, Timeslot, TimeslotData} from "../models/Timeslot";
import {boundClass} from "autobind-decorator";
import TimeslotView from "./TimeslotView";
import {Client} from "../Client";
import {InteractionState} from "../InteractionState";

@boundClass
class TimeslotsView extends React.Component<Properties, State> {
    constructor(props: Properties) {
        super(props);

        this.state = {
            timeslots: [],
        }
    }

    async componentDidMount() {
        await this.refreshTimeslots();
    }

    async addTimeslot() {
        const data: TimeslotData = {
            startHours: 0,
            startMinutes: 0,
            endHours: 0,
            endMinutes: 0,
            capacity: 1
        }

        await Client.createTimeslot(this.props.weekday.name, data);

        await this.refreshTimeslots();
    }

    async deleteTimeslot(timeslotId: number) {
        await Client.deleteTimeslot(timeslotId);

        await this.refreshTimeslots();
    }

    async refreshTimeslots() {
        const timeslots = await Client.getTimeslots(this.props.weekday.name);

        this.setState({
            ...this.state,
            timeslots: timeslots
        })
    }

    render() {
        const sortedTimeslots: Timeslot[] = _
            .sortWith(this.state.timeslots, compare);

        return (
            <div className="TimeslotsView">
                <ListGroup className="Listing">
                    {
                        sortedTimeslots
                            .map(timeslot =>
                                <ListGroup.Item>
                                    <TimeslotView
                                        changeInteractionState={this.props.changeInteractionState}
                                        timeslotId={timeslot.id}
                                        onDelete={this.refreshTimeslots}
                                    />
                                </ListGroup.Item>
                            )
                    }
                </ListGroup>

                <ButtonGroup className="Listing">
                    <Button onClick={this.addTimeslot}>
                        <FontAwesomeIcon icon={faPlus}/> Timeslot hinzufügen
                    </Button>
                </ButtonGroup>
            </div>
        );
    }
}

interface Properties {
    weekday: Weekday
    changeInteractionState: (interactionState: InteractionState) => unknown
}

interface State {
    timeslots: Timeslot[];
}

export default TimeslotsView;
