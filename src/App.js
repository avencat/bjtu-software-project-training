import React, { Component } from 'react';
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

  componentDidMount() {
    this.fetchPosts();
  }

  fetchPosts() {
    fetch().then(data => {
      this.setState({
        logo: data.profilePicture
      });
    })
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
