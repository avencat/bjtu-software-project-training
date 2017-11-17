import React from 'react';
import ReactDOM from 'react-dom';
import Profile from './views/Profile';
import Register from './views/Register';
import Login from './views/Login';
import Home from './views/Home';
import MyPost from './views/MyPost';
import Follow from './views/Follow';
import Following from './views/Following';
import { Router, Route, browserHistory } from 'react-router';

const Root = () => {
    return (
        <div className="container">
            <Router history={browserHistory}>
              <Route path="/" component={Home}/>
              <Route path="/Register" component={Register}/>
              <Route path="/Profile" component={Profile}/>
              <Route path="/mypost" component={MyPost}/>
              <Route path="/follow" component={Follow}/>
              <Route path="/following" component={Following}/>
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