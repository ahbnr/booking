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
import {Booking} from "../models/Booking";
import BookingView from "./BookingView";

@boundClass
export default class BookingsView extends React.Component<Properties, State> {
    constructor(props: Properties) {
        super(props);

        this.state = {
            bookings: [],
        }
    }

    async componentDidMount() {
        await this.refreshBookings();
    }

    async refreshBookings() {
        const bookings = await Client.getBookings(this.props.timeslotId);

        this.setState({
            ...this.state,
            bookings: bookings
        })
    }

    render() {
        return (
            <div className="TimeslotsView">
                <ListGroup className="Listing">
                    {
                        this.state.bookings
                            .map(booking =>
                                <ListGroup.Item>
                                    <BookingView
                                        bookingId={booking.id}
                                        onDelete={this.refreshBookings}
                                    />
                                </ListGroup.Item>
                            )
                    }
                </ListGroup>
            </div>
        );
    }
}

interface Properties {
    timeslotId: number
}

interface State {
    bookings: Booking[];
}

