import React, { Component } from 'react';
import { Link } from 'react-router';
import './App.css';

export default class Nav extends Component {

    render() {
        return (
            <nav className="navbar navbar-default">
              <div className="navbar-header">
                <Link className="navbar-brand" to="/">Home</Link>
              </div>
              <ul className="nav navbar-nav">
                <li>
                  <Link to="/">Profile</Link>
                </li>
                <li>
                  <Link to="/special">Parameters</Link>
                </li>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <li><button className="btn btn-info log">
                    <Link to="/login">
                    Log In
                    </Link>
                </button></li>
                <li><button className="btn btn-danger log">
                    <Link to="/login">
                    Log out
                    </Link>
                </button></li>
              </ul>
            </nav>
        );
    }
}
/*

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Navbar extends Component {
  render() {
    return (
      <div>
        <ul>
          <li style={styles.homeButton}>Home</li>
          <li>Profile</li>
          <li>Parameters</li>
          <li>{this.props.anotherButton}</li>
        </ul>
      </div>
    );
  }
}

const styles = {
  homeButton: {
    backgroundColor:  'blue',
    fontSize:         25,
  }
};

Navbar.propTypes = {
  anotherButton:  PropTypes.string.isRequired
};

Navbar.defaultProps = {
  anotherButton:  'Default'
};*/