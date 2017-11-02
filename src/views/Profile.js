import React, { Component } from 'react';
import Nav from '../components/Navbar';
import UserForm from '../components/UserForm';
import Alert from '../components/Alert';
import 'whatwg-fetch';

export default class Profile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      login: '',
      email: '',
      firstname: '',
      lastname: '',
      password: '',
      confirmedPassword: '',
      flashStatus: '',
      flashMessage: '',
      showFlashMessage: false
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleHideFlashMessage = this.handleHideFlashMessage.bind(this);
  }

  componentDidMount() {
    fetch("http://localhost:3001/users/" + sessionStorage.getItem("userId"), {
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

      fetch("http://localhost:3001/users/" + sessionStorage.getItem("userId"), {

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

          this.setState({

            flashStatus: 'success',
            flashMessage: 'User successfully updated',
            showFlashMessage: true

          });

        }

      }).catch((err) => {

        console.log(err)

      });
    }
  }

  handleHideFlashMessage() {

    this.setState({

      flashStatus: '',
      flashMessage: '',
      showFlashMessage: false

    });

  }



  render() {

    const { login, firstname, lastname, email, password, confirmedPassword, showFlashMessage, flashStatus, flashMessage } = this.state;

    return (
      <div style={{position: 'relative'}}>

        <Alert
          visible={showFlashMessage}
          message={flashMessage}
          status={flashStatus}
          dismissTimer={6000}
          onDismiss={this.handleHideFlashMessage}
        />

        <Nav location={this.props.location}/>

        <div className="col-sm-12">

          <div className="jumbotron text-center">

            <h2>Edit Profile</h2>

            <UserForm

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
