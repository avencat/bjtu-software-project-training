import React, { Component } from 'react';
import Nav from '../components/Navbar';
import 'whatwg-fetch';

class Profile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      login: '',
      email: '',
      firstname: '',
      lastname: '',
      password: '',
      confirmedPassword: ''
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    fetch("http://localhost:3001/api/user", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      }
    }).then((data) => {
      return data.json()
    }).then((data) => {
      console.log(data);
      if (data.status === "success") {
        this.setState(data.user);
      }
    }).catch((err) => {
      console.log(err)
    });
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

      fetch("http://localhost:3001/api/user", {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
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
          this.props.router.push('/profile');
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

            <h2>Edit Profile</h2>

            <form className="form-horizontal" onSubmit={this.onSubmit}>

              <div className="form-group">
                <span className="col-sm-1"/>

                <label className="control-label col-sm-2" htmlFor="login">Username :</label>

                <div className="col-sm-8">
                  <input className="form-control" value={login} name='login' id="login" onChange={this.onChange}/>
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
                  <input className="form-control" type="email" value={email} name='email' id="email" onChange={this.onChange}/>
                </div>

                <span className="col-sm-1"/>
              </div>

              <div className="form-group">
                <span className="col-sm-1"/>

                <label className="control-label col-sm-2" htmlFor="password">Password :</label>

                <div className="col-sm-8">
                  <input className="form-control" type="password" value={password} name='password' id="password" onChange={this.onChange}/>
                </div>

                <span className="col-sm-1"/>
              </div>

              <div className="form-group">
                <span className="col-sm-1"/>

                <label className="control-label col-sm-2" htmlFor="confirmedPassword">Confirm password :</label>

                <div className="col-sm-8">
                  <input className="form-control" type="password" value={confirmedPassword} name='confirmedPassword' id="confirmedPassword" onChange={this.onChange}/>
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

export default Profile;