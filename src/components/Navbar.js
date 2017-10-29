import React, { Component } from 'react';
import { Link } from 'react-router';
import '../App.css';

export default class Nav extends Component {

  constructor(props) {
    super(props);

    this.onLogout = this.onLogout.bind(this);
  }

  componentWillMount() {
    const isLoggedIn = sessionStorage.getItem("userToken");

    this.MyButton = (
      <li><button className="btn btn-info log">
        <Link to="/login">
          Log In
        </Link>
      </button></li>
    );

    if (isLoggedIn) {

      this.MyButton = (
        <li>
          <button onClick={this.onLogout} className="btn btn-danger log">
            <Link to="/login">
              Log out
            </Link>
          </button>
        </li>
      )

    } else if (this.props.location && this.props.location.pathname === '/login') {

      this.MyButton = (
        <li>
          <button className="btn log">
            <Link to="/Register">
              Register
            </Link>
          </button>
        </li>
      );

    }
  }

  onLogout() {
    sessionStorage.removeItem("userToken")
    // TODO call server function to delete the token on the server too
  }
  render() {
    return (
      <nav className="navbar navbar-default">
        {/*
              <div className="navbar-header">
                <Link className="navbar-brand" to="/">Home</Link>
              </div>
              <ul className="nav navbar-nav">
                <li>
                  <Link to="/">Profile</Link>
                </li>
                <li>
                  <Link to="/Register">Register</Link>
                </li>
              </ul>*/}
        <ul className="nav navbar-nav navbar-right">
          {this.MyButton}
        </ul>
      </nav>
    );
  }
}