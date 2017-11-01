import React from 'react';
import ReactDOM from 'react-dom';
import Profile from './views/Profile';
import Register from './views/Register';
import Login from './views/Login';
import Home from './views/Home';
import { Router, Route, browserHistory } from 'react-router';

const Root = () => {
    return (
        <div className="container">
            <Router history={browserHistory}>
              <Route path="/" component={Home}/>
              <Route path="/Register" component={Register}/>
              <Route path="/Profile" component={Profile}/>
              <Route path="/login" component={Login}/>
            </Router>
        </div>
    )
};

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