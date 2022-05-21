import React from "react";
import "./index.css";
import { Helmet } from "react-helmet-async";
import { Container } from "./components/Container";
import { Darken } from "./components/Darken";
import { Loading } from "./components/Loading";

function App() {
    return (
        <>
            <Helmet>
                <script
                    src="https://kit.fontawesome.com/a99df0f94f.js"
                    crossOrigin="anonymous"
                ></script>
            </Helmet>
            <Container />
            <Darken />
            <Loading />
        </>
    );
}

export default App;
