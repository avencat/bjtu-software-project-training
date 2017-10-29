import React, { Component } from 'react';
import Nav from '../components/Navbar';
import 'whatwg-fetch';
import { Redirect } from 'react-router';

class Register extends Component {

  constructor(props) {
    super(props);

    this.state = {
      login: '',
      email:'',
      firstname:'',
      lastname:'',
      password: '',
      confirmedPassword:'',
      redirect: false
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    // Because we named the inputs to match their corresponding values in state, it's
    // super easy to update the state
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  onSubmit(e) {

    e.preventDefault();

    // get our form data out of state
    const { login, email, firstname, lastname, password, confirmedPassword } = this.state;

    if (confirmedPassword === password) {

      fetch("http://localhost:3001/api/register", {

        method: 'POST',

        headers: {

          'Accept': 'application/json',
          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          "login": login,
          "email": email,
          "firstname": firstname,
          "lastname": lastname,
          "password": password,

        })
      }).then((data) => data.json()).then((data) => {

          if (data.status === "success") {

            this.props.router.push('/login');

          }

      }).catch((err) => {

        console.log(err)

      });

    }
  }

  render() {
    const { login, firstname, lastname, email, password, confirmedPassword, redirect } = this.state;

    return (
      <div>

        <Nav location={this.props.location}/>

        <div className="col-sm-12">

          <div className="jumbotron text-center">

            <h2>Register</h2>

            <form className="form-horizontal" onSubmit={this.onSubmit}>

              <div className="form-group">
                <span className="col-sm-1"/>

                <label className="control-label col-sm-2" htmlFor="login">Username :</label>

                <div className="col-sm-8">
                  <input className="form-control" required={true} value={login} name='login' id="login" onChange={this.onChange}/>
                </div>

                <span className="col-sm-1"/>
              </div>

              <div className="form-group">
                <span className="col-sm-1"/>

                <label className="control-label col-sm-2" htmlFor="firstname">First name :</label>

                <div className="col-sm-8">
                  <input className="form-control" value={firstname} name='firstname' id="firstname" onChange={this.onChange}/>
                </div>

                <span className="col-sm-1"/>
              </div>

              <div className="form-group">
                <span className="col-sm-1"/>

                <label className="control-label col-sm-2" htmlFor="lastname">Last name :</label>

                <div className="col-sm-8">
                  <input className="form-control" value={lastname} name='lastname' id="lastname" onChange={this.onChange}/>
                </div>

                <span className="col-sm-1"/>
              </div>

              <div className="form-group">
                <span className="col-sm-1"/>

                <label className="control-label col-sm-2" htmlFor="email">Email :</label>

                <div className="col-sm-8">
                  <input className="form-control" required={true} type="email" value={email} name='email' id="email" onChange={this.onChange}/>
                </div>

                <span className="col-sm-1"/>
              </div>

              <div className="form-group">
                <span className="col-sm-1"/>

                <label className="control-label col-sm-2" htmlFor="password">Password :</label>

                <div className="col-sm-8">
                  <input className="form-control" required={true} type="password" value={password} name='password' id="password" onChange={this.onChange}/>
                </div>

                <span className="col-sm-1"/>
              </div>

              <div className="form-group">
                <span className="col-sm-1"/>

                <label className="control-label col-sm-2" htmlFor="confirmedPassword">Confirm password :</label>

                <div className="col-sm-8">
                  <input className="form-control" required={true} type="password" value={confirmedPassword} name='confirmedPassword' id="confirmedPassword" onChange={this.onChange}/>
                </div>

                <span className="col-sm-1"/>
              </div>

              <div>
                <input className="btn btn-lg btn-success" type="submit" value="Submit"/>
              </div>

            </form>
          </div>
        </div>
      </div>
    );

  }
}

export default Register;