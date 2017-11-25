import React, { Component } from 'react';
import Nav from '../components/Navbar';
import ToFollow from '../components/ToFollow';


export default class Follow extends Component {

  constructor(props) {
    super(props);

    this.state = {
      listFollow: [],
      follows: [],
      isFollowed: false,
      listUsers: [],
      showFlashMessage: false,
      flashMessage: '',
      flashStatus: '',
      flashTimer: 0
    };

    this.displayAlert = this.displayAlert.bind(this);
  };

  componentDidMount() {

    const searchValue = new URLSearchParams(this.props.location.search).get("search");

    this.fetchSearch(searchValue)

  }

  displayAlert(message = '', status = 'info', timer = 5000) {

    this.setState({

      showFlashMessage: true,
      flashMessage: message,
      flashStatus: status,
      flashTimer: timer

    });

  }



  fetchSearch(searchValue) {

    fetch("http://localhost:3001/users?q=" + searchValue, {

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

        const listFollow = data.data.map((oneUser) => (
          <ToFollow
            key={oneUser.id}
            following_date={oneUser.following_date}
            friendship_id={oneUser.friendship_id}
            userToFollow={oneUser}
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

            <h2 className="text-center">Follow</h2>

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