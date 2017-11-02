import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Alert extends Component {

  constructor(props) {
    super(props);

    this.resetTimer = this.resetTimer.bind(this);
  }

  resetTimer() {

    clearTimeout(this.timeout);
    this.props.onDismiss();

  }

  render() {

    if (this.props.visible) {

      this.timeout = setTimeout(this.resetTimer, this.props.dismissTimer || 5000);

    }

    return (

      <div
        className={'alert alert-dismissible fade show alert-' + this.props.status + ' ' + (this.props.visible ? 'in' : 'out')}
        style={styles.alert}
      >
        <button type="button" className="close" aria-label="Close" onClick={this.resetTimer}>
            <span aria-hidden="true">&times;</span>
        </button>
        {this.props.message}
      </div>

    );

  }

}

const styles = {

  alert: {

    position: 'absolute',
    width: "100%",
    top: 25

  }

};

Alert.propTypes = {
  message: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onDismiss: PropTypes.func,
  visible: PropTypes.bool.isRequired,
  dismissTimer: PropTypes.number
};