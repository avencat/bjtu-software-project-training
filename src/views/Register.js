import React, { Component } from 'react';
import Nav from '../components/Navbar';
import UserForm from '../components/UserForm';
import 'whatwg-fetch';

class Register extends Component {

  constructor(props) {
    super(props);

    this.state = {
      login: '',
      email:'',
      firstname:'',
      lastname:'',
      password: '',
      confirmedPassword:''
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
    const { login, firstname, lastname, email, password, confirmedPassword } = this.state;

    return (
      <div>

        <Nav location={this.props.location}/>

        <div className="col-sm-12">

          <div className="jumbotron text-center">

            <h2>Register</h2>

            <UserForm

              emailRequired
              loginRequired
              passwordRequired

              email={email}
              login={login}
              lastname={lastname}
              password={password}
              firstname={firstname}
              confirmedPassword={confirmedPassword}

              onChange={this.onChange.bind(this)}
              onSubmit={this.onSubmit.bind(this)}

            />

          </div>
        </div>
      </div>
    );

  }
}

export default Register;