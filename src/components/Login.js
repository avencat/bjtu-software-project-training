import React, { Component } from 'react';
import Nav from '../Navbar';
import 'whatwg-fetch';

class Login extends Component {

  constructor() {
    super();
    this.state = {
      login: '',
      password: '',
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
    const { login, password } = this.state;


    fetch("http://192.168.31.244:3001/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "login": login,
        "password": password,
      })
    })

  }

  componentDidMount() {

  }

  render() {
    const { login, password} = this.state;
    return (
      <div>
        <Nav />
        <h3 className="text-center">Register</h3>
        <hr/>

        <div className="col-sm-12">
          <div className="jumbotron text-center">
            <h2>Login</h2>
            <form onSubmit={this.onSubmit}>
              <div>
                <label>
                  Email :
                </label>
                <input type="login" id="login" value={login} name='login' onChange={this.onChange} />
              </div>
              <div>
                <label>
                  Password :
                </label>
                <input type="password" id="password" value={password} name='password' onChange={this.onChange} />
              </div>
              <div>
                <input className="btn btn-lg btn-success" type="submit" value="Submit" />
              </div>

            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;