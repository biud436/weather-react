import React from "react";
import { Timer } from "../store";
import { TimerView } from "./components/timerView";
import "./index.css";
import { Helmet } from "react-helmet-async";
import { Container } from "./components/Container";

function App() {
    return (
        <div className="App">
            <Helmet>
                <script
                    src="https://kit.fontawesome.com/a99df0f94f.js"
                    crossOrigin="anonymous"
                ></script>
            </Helmet>
            <TimerView timer={new Timer()} />
            <Container />
        </div>
    );
}

export default App;
