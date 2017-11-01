import React, { Component } from 'react'
import PropTypes from 'prop-types';


export default class UserForm extends Component {

  render() {
    return (
      <form className="form-horizontal" onSubmit={this.props.onSubmit}>

        <div className="form-group">
          <span className="col-sm-1"/>

          <label className="control-label col-sm-2" htmlFor="login">Username :</label>

          <div className="input-group col-sm-8">
            <input className="form-control" required={this.props.loginRequired} value={this.props.login} name='login' id="login" onChange={this.props.onChange}/>
            <span className="input-group-addon"><i className="material-icons">account_circle</i></span>
          </div>

          <span className="col-sm-1"/>
        </div>

        <div className="form-group">
          <span className="col-sm-1"/>

          <label className="control-label col-sm-2" htmlFor="firstname">First name :</label>

          <div className="input-group col-sm-8">
            <input className="form-control" value={this.props.firstname} name='firstname' id="firstname" onChange={this.props.onChange}/>
            <span className="input-group-addon"><i className="material-icons">account_circle</i></span>
          </div>

          <span className="col-sm-1"/>
        </div>

        <div className="form-group">
          <span className="col-sm-1"/>

          <label className="control-label col-sm-2" htmlFor="lastname">Last name :</label>

          <div className="input-group col-sm-8">
            <input className="form-control" value={this.props.lastname} name='lastname' id="lastname" onChange={this.props.onChange}/>
            <span className="input-group-addon"><i className="material-icons">account_circle</i></span>
          </div>

          <span className="col-sm-1"/>
        </div>

        <div className="form-group">
          <span className="col-sm-1"/>

          <label className="control-label col-sm-2" htmlFor="email">Email :</label>

          <div className="input-group col-sm-8">
            <input className="form-control" required={this.props.emailRequired} type="email" value={this.props.email} name='email' id="email" onChange={this.props.onChange}/>
            <span className="input-group-addon"><i className="material-icons">@</i></span>
          </div>

          <span className="col-sm-1"/>
        </div>

        <div className="form-group">
          <span className="col-sm-1"/>

          <label className="control-label col-sm-2" htmlFor="password">Password :</label>

          <div className="input-group col-sm-8">
            <input className="form-control" required={this.props.passwordRequired} type="password" value={this.props.password} name='password' id="password" onChange={this.props.onChange} aria-describedby="passwordHelpBlock"/>
            <span className="input-group-addon"><i className="material-icons">lock</i></span>
          </div>

          <span className="col-sm-1"/>
        </div>

        <div className="form-group">
          <span className="col-sm-1"/>

          <label className="control-label col-sm-2" htmlFor="confirmedPassword">Confirm password :</label>

          <div className="input-group col-sm-8">
            <input className="form-control" required={this.props.passwordRequired} type="password" value={this.props.confirmedPassword} name='confirmedPassword' id="confirmedPassword" onChange={this.props.onChange}/>
            <span className="input-group-addon"><i className="material-icons">lock</i></span>
          </div>

          <span className="col-sm-1"/>
        </div>

        <div>
          <input className="btn btn-lg btn-success" type="submit" value="Submit"/>
        </div>

      </form>
    );
  }

}

UserForm.propTypes = {

  login: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  lastname: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  firstname: PropTypes.string.isRequired,
  confirmedPassword: PropTypes.string.isRequired,

  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,

};
