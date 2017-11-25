import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from "moment/moment";


export default class ToFollow extends Component {


  constructor(props) {
    super(props);

    this.state = {

      followId: this.props.friendship_id,
      userToFollow: this.props.userToFollow || {},
      friendship_id: this.props.friendship_id || null,
      following_date: this.props.following_date || null

    };

    this.onFollow = this.onFollow.bind(this);
    this.onUnfollow = this.onUnfollow.bind(this);
    this.onClickOnUser = this.onClickOnUser.bind(this);
  }


  onFollow() {

    fetch("http://localhost:3001/friendships", {

      method: 'POST',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      },

      body: JSON.stringify({
        "following_id": this.state.userToFollow.id
      })

    }).then((data) => {
      return data.json()
    }).then((data) => {

      if (data.status === "success") {

        let friendship_id = data.friendship_id;

        this.setState({ friendship_id, following_date: Date.now() });

        this.props.fetchFollowers();

      } else {

        this.props.displayAlert(

          data.message,
          'danger',
          10000

        );

      }

    }).catch((err) => {
      this.props.displayAlert(

        (err instanceof TypeError) ? "Couldn't connect to the server, please try again later. If the error persists, please contact us at social@network.net" : err.message,
        'danger',
        10000

      );
    });

  }


  onUnfollow() {

      fetch("http://localhost:3001/friendships/" + this.state.friendship_id, {

        method: 'DELETE',

        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
        }

      }).then((data) => {
        return data.json()
      }).then((data) => {

        if (data.status === "success") {


          let friendship_id = data.friendship_id;

          this.setState({ friendship_id, following_date: null });

          this.props.fetchFollowers();

        } else {

          this.props.displayAlert(

            data.message,
            'danger',
            10000

          );

        }

      }).catch((err) => {
        this.props.displayAlert(

          (err instanceof TypeError) ? "Couldn't connect to the server, please try again later. If the error persists, please contact us at social@network.net" : err.message,
          'danger',
          10000

        );
      });

  }


  onClickOnUser() {

    const { userToFollow } = this.state;

    this.props.router.push({ pathname: '/user', state: { user: userToFollow } });

  }


  render() {

    const { userToFollow, friendship_id, following_date } = this.state;

    return (

      <li className="list-group-item" style={styles.postContainer}>
        <div>

          <div className="row">

            <span className="col-lg-10" style={styles.userContainer}>
              <b className="underline" style={styles.stylePostLogin} onClick={this.onClickOnUser}>
                {
                  (userToFollow.firstname && userToFollow.lastname) ?

                    userToFollow.firstname + ' ' + userToFollow.lastname

                  :

                    userToFollow.login
                }
              </b>
              {
                friendship_id &&
                  <span style={{fontSize: 14, marginLeft: 5}}>
                    {
                        ` - Followed since ${moment(following_date).format("DD MMMM YYYY HH:mm")}`
                    }
                  </span>
              }
            </span>


            <span style={styles.actionButtons}>

              <button className={"btn btn-" + (this.state.friendship_id? 'danger' : 'primary')} type="button" onClick={() => { this.state.friendship_id ? this.onUnfollow() : this.onFollow()}}  style={styles.actionButton}>

                <i>{this.state.friendship_id ? 'Unfollow' : 'Follow'}</i>

              </button>

            </span>

          </div>


        </div>
      </li>

    );

  }

}


const styles = {

  actionButton: {

    marginRight: 10

  },

  actionButtons: {

    position: 'absolute',
    right: 0,
    top: 5

  },

  postContainer: {

    position: 'relative'

  },

  stylePostContent: {

    fontSize: 21,
    marginTop: 10,
    WebkitHyphens: 'auto',
    MozHyphens: 'auto',
    msHyphens: 'auto',
    OHyphens: 'auto',
    hyphens: 'auto',
    wordWrap: 'break-word'

  },

  userContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  stylePostLogin: {

    cursor: 'pointer',
    fontSize: 20,
    paddingLeft: 0,

  }

};


ToFollow.propTypes = {

  userToFollow: PropTypes.object.isRequired,
  friendship_id: PropTypes.number,

  displayAlert: PropTypes.func.isRequired

};
