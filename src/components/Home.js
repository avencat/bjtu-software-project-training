import React, { Component } from 'react';
import Nav from '../Navbar';

class Profile extends Component {


  componentDidMount() {
  }

  render() {

    return (
      <div>
        <Nav location={this.props.location}/>
        <h3 className="text-center">Home</h3>
        <hr/>


        <div className="col-sm-12">
          <div className="jumbotron text-center">
            <h2>Home</h2>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;