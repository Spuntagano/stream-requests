import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import VideoComponent from './components/VideoComponent/VideoComponent';
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';

ReactDOM.render(
    <App>
        <VideoComponent />
    </App>,
    document.getElementById('root')
);

