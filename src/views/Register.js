import React, { Component } from 'react';
import Nav from '../components/Navbar';
import UserForm from '../components/UserForm';
import 'whatwg-fetch';
import Alert from '../components/Alert';

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
      alertVisible: !!props.location.state,
      flashTimer: 5000,
      flashStatus: props.location.state ? props.location.state.flashStatus : 'danger',
      flashMessage: props.location.state ? props.location.state.flashMessage : ''
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.displayAlert = this.displayAlert.bind(this);
    this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
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

      fetch("http://localhost:3001/register", {

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

            this.props.router.replace({ pathname: '/login', state: { flashStatus: "success", flashMessage: "You successfully registered, you can now login!" } });

          } else if (data.status === "error") {

            this.displayAlert(

              data.message,
              'danger',
              10000

            );

          }

      }).catch((err) => {

        this.displayAlert(

          (err instanceof TypeError) ? "Couldn't connect to the server, please try again later. If the error persists, please contact us at social@network.net" : err.message,
          'danger',
          10000

        );

      });

    } else {

      this.displayAlert(

        'Passwords don\'t match',
        'danger',
        3000

      );

    }
  }


  handleAlertDismiss() {
    this.setState({
      alertVisible: false
    });
  }


  displayAlert(message = '', status = 'info', timer = 5000) {

    this.setState({

      alertVisible: true,
      flashMessage: message,
      flashStatus: status,
      flashTimer: timer

    });

  }


  render() {

    const { login, firstname, lastname, email, password, confirmedPassword, alertVisible, flashTimer, flashStatus, flashMessage } = this.state;

    return (
      <div style={{position: 'relative'}}>

        <Alert
          visible={alertVisible}
          message={flashMessage}
          status={flashStatus}
          dismissTimer={flashTimer}
          onDismiss={this.handleAlertDismiss}
        />

        <Nav location={this.props.location} router={this.props.router} />

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