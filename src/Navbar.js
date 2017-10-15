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
};