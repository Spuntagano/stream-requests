import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import Panel from './components/Panel/Panel';
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';

ReactDOM.render(
    <App>
        <Panel />
    </App>,
    document.getElementById('root')
);

