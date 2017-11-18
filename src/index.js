import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import Profile from './views/Profile';
import Register from './views/Register';
import Login from './views/Login';
import Home from './views/Home';
import Follow from './views/Follow';
import Following from './views/Following';
import User from './views/User';

const Root = () => {
    return (
        <div className="container">
            <Router history={browserHistory}>
              <Route path="/" component={Home}/>
              <Route path="/register" component={Register}/>
              <Route path="/settings" component={Profile}/>
              <Route path="/profile" component={User}/>
              <Route path="/follow" component={Follow}/>
              <Route path="/following" component={Following}/>
              <Route path="/login" component={Login}/>
              <Route path="/user" component={User}/>
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