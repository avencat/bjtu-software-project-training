import React, { Component } from 'react';
import Nav from '../Navbar';
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

      fetch("http://192.168.31.244:3001/api/register", {
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
      }).then((data) => {
        return data.json()
      }).then((data) => {
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

    if (redirect) {
      return (
        <Redirect to='/login'/>
      );
    } else {

      return (
        <div>
          <Nav location={this.props.location}/>
          <div className="col-sm-12">
            <div className="jumbotron text-center">
              <h2>Register Form</h2>
              <form onSubmit={this.onSubmit}>
                <div>
                  <label>
                    Login :
                  </label>
                  <input required={true} value={login} name='login' id="login" onChange={this.onChange}/>
                </div>
                <div>
                  <label>
                    FirstName :
                  </label>
                  <input value={firstname} name='firstname' id="firstname" onChange={this.onChange}/>
                </div>
                <div>
                  <label>
                    LastName :
                  </label>
                  <input value={lastname} name='lastname' id="lastname" onChange={this.onChange}/>
                </div>
                <div>
                  <label>
                    Email :
                  </label>
                  <input required={true} type="email" value={email} name='email' id="email" onChange={this.onChange}/>
                </div>
                <div>
                  <label>
                    Password :
                  </label>
                  <input required={true} type="password" value={password} name='password' id="password" onChange={this.onChange}/>
                </div>
                <div>
                  <label>
                    Confirm password :
                  </label>
                  <input required={true} type="password" value={confirmedPassword} name='confirmedPassword' id="confirmedPassword" onChange={this.onChange}/>
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
}

export default Register;