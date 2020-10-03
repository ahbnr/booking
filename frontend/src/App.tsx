import React from 'react';
import './App.css';
import WeekdaysView from "./views/WeekdaysView";
import 'bootstrap/dist/css/bootstrap.min.css';
import {CreateBooking, InteractionState, ViewingWeekdays} from "./InteractionState";
import {boundClass} from "autobind-decorator";
import TimeslotsView from "./views/TimeslotsView";
import CreateBookingDialog from "./views/CreateBookingDialog";
import BookingsView from "./views/BookingsView";

@boundClass
class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.state =  {
            interactionState: new ViewingWeekdays()
        };
    }

    changeInteractionState(interactionState: InteractionState) {
        this.setState({
            interactionState: interactionState
        });
    }

    render() {
        let view;
        switch (this.state.interactionState.type) {
            case 'ViewingWeekdays':
                view = <WeekdaysView changeInteractionState={this.changeInteractionState}/>;
                break;
            case 'ViewingTimeslots':
                view = <TimeslotsView changeInteractionState={this.changeInteractionState} weekday={this.state.interactionState.weekday} />;
                break;

            case 'ViewingBookings':
                view = <BookingsView timeslotId={this.state.interactionState.timeslot.id} />;
                break;

            case 'CreateBooking':
                view = <CreateBookingDialog changeInteractionState={this.changeInteractionState} timeslot={this.state.interactionState.timeslot} />
                break;
        }

        return (<div className="App">
                <header className="App-header">
                    {view}
                </header>
            </div>
        );
    }
}

interface AppProps {}

interface AppState {
    interactionState: InteractionState
}

export default App;
