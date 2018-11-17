import * as React from "react"
import * as ReactDOM from "react-dom"
import LiveConfigPage from "./components/LiveConfigPage/LiveConfigPage"
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';

ReactDOM.render(
    <LiveConfigPage/>,
    document.getElementById("root")
);