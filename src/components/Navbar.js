import React, { Component } from 'react';
import { Link } from 'react-router';
import '../App.css';

export default class Nav extends Component {


  constructor(props) {
    super(props);

    this.user = sessionStorage.getItem("userToken");

    this.onLogout = this.onLogout.bind(this);
  }


  componentWillMount() {
    const isLoggedIn = sessionStorage.getItem("userToken");

    this.MyButton = (
      <li><button className="btn btn-warning log">
        <Link to="/login" style={styles.whiteLink}>
          Log In
        </Link>
      </button></li>
    );

    if (isLoggedIn) {

      this.MyButton = (
        <li>
          <button onClick={this.onLogout} className="btn btn-danger log">
            <Link to="/login" style={styles.whiteLink}>
              Log out
            </Link>
          </button>
        </li>
      )

    } else if (this.props.location && this.props.location.pathname === '/login') {

      this.MyButton = (
        <li>
          <button className="btn btn-success log">
            <Link to="/Register" style={styles.whiteLink}>
              Register
            </Link>
          </button>
        </li>
      );

    }
  }


  onLogout() {
    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("userId");
    // TODO call server function to delete the token on the server too
  }


  render() {


    let styleNavBar = {
      backgroundColor: "#3798ce"
    };

    let styleNavBarText = {
      color: "#ffffff"
    };

    return (

      <nav className="navbar navbar-default" style={styleNavBar}>
        <div className="navbar-header">

          <Link className="navbar-brand" to="/">
            <span style={styleNavBarText}>Home</span>
          </Link>

          {
            this.user ?

              <ul className="nav navbar-nav">

                <li>
                  <Link to="/profile">
                    <span style={styleNavBarText}>Profile</span>
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

  whiteLink: {

    color: 'white'

  }

};