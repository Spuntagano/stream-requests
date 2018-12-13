import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Config from './components/Config/Config';
import App from './components/App';
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';

ReactDOM.render(
    <App>
        <Config />
    </App>,
    document.getElementById('root')
);