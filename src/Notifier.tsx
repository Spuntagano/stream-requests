import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Notifier from './components/Notifier/Notifier';

ReactDOM.render((
    <HashRouter>
        <Switch>
            <Route exact path="/:userId" component={Notifier} />
        </Switch>
    </HashRouter>
), document.getElementById('root'));
