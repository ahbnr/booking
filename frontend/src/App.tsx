import React from 'react';
import './App.css';
import WeekdaysView from "./views/WeekdaysView";
import { Weekday } from "./models/Weekday";
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.refreshWeekdays = this.refreshWeekdays.bind(this);

        this.state =  {
            weekdays: []
        };
    }

    async componentDidMount() {
        await this.refreshWeekdays();
    }

    async refreshWeekdays() {
        const weekdays = await fetch(
            'http://localhost:3000/weekdays'
        );

        this.setState({
            ...this.state,
            weekdays: await weekdays.json()
        })
    }

    render() {
        return (<div className="App">
                <header className="App-header">
                    <WeekdaysView weekdays={this.state.weekdays} refreshWeekdays={this.refreshWeekdays}/>
                </header>
            </div>
        );
    }
}

interface AppProps {}

interface AppState {
    weekdays: Weekday[]
}

export default App;
