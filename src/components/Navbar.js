import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import '../App.css';

export default class Navbar extends Component {


  constructor(props) {
    super(props);

    this.user = sessionStorage.getItem("userToken");

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onRegister = this.onRegister.bind(this);
  }


  componentWillMount() {
    const isLoggedIn = sessionStorage.getItem("userToken");

    this.MyButton = (
      <li>
        <button onClick={this.onLogin} className="btn btn-warning log" style={styles.whiteLink}>
          Sign in
        </button>
      </li>
    );

    if (isLoggedIn) {

      this.MyButton = (
        <li>
          <button onClick={this.onLogout} className="btn btn-danger log">
            Sign out
          </button>
        </li>
      )

    } else if (this.props.location && this.props.location.pathname === '/login') {

      this.MyButton = (
        <li>
          <button className="btn btn-success log" onClick={this.onRegister}>
            Register
          </button>
        </li>
      );

    }
  }


  onLogin() {

    this.props.router.replace({ pathname: '/login' });

  }


  onLogout() {

    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("userId");
    this.props.router.replace({ pathname: '/login', state: { flashStatus: "info", flashMessage: "Goodbye!" } });
    // TODO call server function to delete the token on the server too

  }


  onRegister() {

    this.props.router.replace({ pathname: '/register' });

  }


  render() {

    return (

      <nav className="navbar navbar-default" style={styles.styleNavBar}>
        <div className="navbar-header">

          <Link className="navbar-brand" to="/">
            <span style={styles.styleNavBarText}>Home</span>
          </Link>

          {
            this.user ?

              <ul className="nav navbar-nav">

                <li>
                  <Link to="/profile">
                    <span style={styles.styleNavBarText}>Profile</span>
                  </Link>
                </li>

              </ul>

            :

              <div/>

          }
        </div>

        <ul className="nav navbar-nav navbar-right">
          {this.MyButton}
        </ul>

      </nav>
    );
  }
}


const styles = {

  styleNavBar: {

    backgroundColor: "#3798ce",
    borderRadius: 0,
    left: 0,
    margin: -1,
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 2,

  },

  styleNavBarText: {

    color: "#ffffff"

  },

  whiteLink: {

    color: 'white'

  }

};

Navbar.propTypes = {

  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired

};