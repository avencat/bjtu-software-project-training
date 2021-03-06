import React, { Component } from 'react';
import Nav from '../components/Navbar';
import ToFollow from '../components/ToFollow';


export default class Following extends Component {

  constructor(props) {
    super(props);

    this.state = {
      listFollow: [],
      follows: [],
      isFollowed: false,
      listUsers: [],
      followingNB: 0,
      followerNB: 0,
      showFlashMessage: false,
      flashMessage: '',
      flashStatus: '',
      flashTimer: 0
    };

    this.displayAlert = this.displayAlert.bind(this);
    this.fetchNBFollow = this.fetchNBFollow.bind(this);
  };

  componentDidMount() {

    this.fetchListFollow();
    this.fetchNBFollow();

  }

  displayAlert(message = '', status = 'info', timer = 5000) {

    this.setState({

      showFlashMessage: true,
      flashMessage: message,
      flashStatus: status,
      flashTimer: timer

    });

  }

  fetchNBFollow() {

    fetch("http://localhost:3001/followingNb?user_id=" + sessionStorage.getItem("userId"), {

      method: 'GET',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      }

    }).then((data) => {
      return data.json()
    }).then((data) => {

      if (data.status === "success") {

        this.setState({
          followingNB: data.data
        });
      } else {

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

    fetch("http://localhost:3001/followerNb?user_id=" + sessionStorage.getItem("userId"), {

      method: 'GET',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      }

    }).then((data) => {
      return data.json()
    }).then((data) => {

      if (data.status === "success") {

        this.setState({
          followerNB: parseInt(data.data, 10)
        });
      } else {

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

    })

  }

  fetchListFollow() {

    fetch("http://localhost:3001/friendships", {

      method: 'GET',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      }

    }).then((data) => {
      return data.json()
    }).then((data) => {


      if (data.status === "success") {

        const listFollow = data.data.map((friendship) => (
          <ToFollow
            key={friendship.id}
            following_date={friendship.following_date}
            userToFollow={friendship.user}
            friendship_id={friendship.id}
            fetchFollowers={this.fetchNBFollow}
            displayAlert={this.displayAlert}
            router={this.props.router}
          />
        ));

        this.setState({
          follows: data.data,
          listFollow : []
        }, () => {

          this.setState({
            listFollow
          })

        });
      } else {

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

    })

  }

  render() {

    const { listFollow } = this.state;

    return (
      <div style={{position: 'relative'}}>

        <Nav location={this.props.location} router={this.props.router} />

        <div className="col-sm-12">

          <div className="jumbotron">

            <h2 className="text-center">
              {
                this.state.followingNB + ' following / ' + this.state.followerNB + ' follower' + (this.state.followerNB > 1 ? 's' : '')
              }
            </h2>

            <div>
              <ul className="list-group">
                {listFollow}
              </ul>
            </div>


          </div>

        </div>

      </div>
    );
  }
}