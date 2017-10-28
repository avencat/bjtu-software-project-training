import React, { Component } from 'react';
import Nav from '../Navbar';

class Register extends Component {

    componentDidMount() {
    }

    render() {

        return (
            <div>
                <Nav />
                <h3 className="text-center">Register</h3>
                <hr/>
                <div className="col-sm-12">
                    <div className="jumbotron text-center">
                        <h2>Register Form</h2>
                        <form>
                            <div>
                                <label>
                                    FirstName :
                                </label>
                                <input id="firstName"></input>
                            </div>
                            <div>
                                <label>
                                    LastName :
                                </label>
                                <input id="lastName"></input>
                            </div>
                            <div>
                                <label>
                                    Email :
                                </label>
                                <input type="email" id="Email"></input>
                            </div>
                            <div>
                                <label>
                                    Password :
                                </label>
                                <input type="password" id="password"></input>
                            </div>
                            <div>
                                <label>
                                    Confirm password :
                                </label>
                                <input type="password" id="confirmPassword"></input>
                            </div>
                            <div>
                            <input className="btn btn-lg btn-success" type="submit" value="Submit"></input>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default Register;