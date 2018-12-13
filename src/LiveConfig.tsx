import * as React from 'react';
import * as ReactDOM from 'react-dom';
import LiveConfig from './components/LiveConfig/LiveConfig';
import App from './components/App';
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';

ReactDOM.render(
    <App>
        <LiveConfig />
    </App>,
    document.getElementById("root")
);