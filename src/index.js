import React from 'react';
import ReactDOM from 'react-dom';
import Profile from './components/Profile';
import Register from './components/Register';
import Login from './components/Login';
import { Router, Route, browserHistory } from 'react-router';

const Root = () => {
    return (
        <div className="container">
            <Router history={browserHistory}>
                <Route path="/" component={Register}/>
                <Route path="/special" component={Profile}/>
                <Route path="/login" component={Login}/>
            </Router>
        </div>
    )
}

ReactDOM.render(<Root />, document.getElementById('root'));
/*
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
*/