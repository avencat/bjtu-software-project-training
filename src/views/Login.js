import React, { Component } from 'react';
import Nav from '../components/Navbar';
import 'whatwg-fetch';
import Alert from '../components/Alert';

class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      login: '',
      password: '',
      alertVisible: true
    };

    this.flashStatus = null;
    this.flashMessage = null;

    if (props.location.state) {

      this.flashStatus = props.location.state.flashStatus;
      this.flashMessage = props.location.state.flashMessage;

    }

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
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
    const { login, password } = this.state;


    fetch("http://localhost:3001/login", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "login": login,
        "password": password,
      })
    }).then((data) => {
      return data.json()
    }).then((data) => {
      sessionStorage.setItem("userToken", data.token);
      sessionStorage.setItem("userId", data.user_id);

      if (data.status === "success") {
        this.props.router.replace({ pathname: '/', state: { flashStatus: "success", flashMessage: "Welcome!" } });
      }
    }).catch((err) => {
      console.log(err)
    });

  }

  handleAlertDismiss() {
    this.setState({
      alertVisible: false
    });
  }

  render() {
    const { login, password} = this.state;
    return (
      <div style={{position: 'relative'}}>

        {
          this.flashMessage && this.flashStatus ?

            <Alert
              visible={this.state.alertVisible}
              message={this.flashMessage}
              status={this.flashStatus}
              dismissTimer={6000}
              onDismiss={this.handleAlertDismiss}
            />

          :

            <div/>
        }

        <Nav location={this.props.location} router={this.props.router} />

        <div className="col-sm-12">

          <div className="jumbotron text-center">

            <h2>Login</h2>

            <form className="form-horizontal" onSubmit={this.onSubmit}>

              <div className="form-group">
                <span className="col-sm-3"/>

                <label className="control-label col-sm-2" htmlFor="login">Username :</label>

                <div className="col-sm-4">
                  <input className="form-control" required={true} type="text" id="login" value={login} name='login' onChange={this.onChange} />
                </div>

                <span className="col-sm-3"/>
              </div>

              <div className="form-group">
                <span className="col-sm-3"/>

                <label className="control-label col-sm-2" htmlFor="password">Password :</label>

                <div className="col-sm-4">
                  <input className="form-control" required={true} type="password" id="password" value={password} name='password' onChange={this.onChange} />
                </div>

                <span className="col-sm-3"/>
              </div>

              <div>
                <input className="btn btn-lg btn-primary" type="submit" value="Submit" />
              </div>

            </form>

          </div>

        </div>

      </div>
    );
  }
}

export default Login;