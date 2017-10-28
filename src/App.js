import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory } from 'react-router';

ReactDOM.render(
    <Router history={browserHistory}>
    </Router>,
    document.getElementById('app-container')
);

/*import React, { Component } from 'react';
import logoReact from './logo.svg';
import './App.css';
import Navbar from './Navbar';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logo: logoReact,
    };
  }


  render() {
    return (
      <div className="App">
        <Navbar />
        <header className="App-header">
          <img src={this.state.logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/LOL.js</code> and save to reload.
        </p>
        <div>BLBLBL</div>
      </div>
    );
  }
}

export default App;
*/