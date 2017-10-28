import React, { Component } from 'react';
import { Link } from 'react-router';
import Nav from '../Navbar';

class Profile extends Component {

    componentDidMount() {
    }

    render() {

        return (
            <div>
                <Nav />
                <h3 className="text-center">Profile</h3>
                <hr/>


                <div className="col-sm-12">
                    <div className="jumbotron text-center">
                        <h2>Home</h2>
                        <Link className="btn btn-lg btn-success" to='/'>Test</Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default Profile;