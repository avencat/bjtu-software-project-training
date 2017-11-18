import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory } from 'react-router';

ReactDOM.render(
    <Router history={browserHistory}>
    </Router>,
    document.getElementById('app-container')
);
