import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';


export default class Post extends Component {


  constructor(props) {
    super(props);

    this.state = {

      isLike: false,
      likeId: null,
      post: this.props.post || {}

    };


    this.onLike = this.onLike.bind(this);
    this.onDislike = this.onDislike.bind(this);
    this.getListLikes = this.getListLikes.bind(this);
    this.onClickOnUser = this.onClickOnUser.bind(this);
  }


  componentDidMount() {

    this.getListLikes(this.state.post.id);

  }


  getListLikes(postId) {

    fetch("http://localhost:3001/likes?post_id=" + postId, {

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

        const listLikes = data.data;

        for (let i = 0; i < listLikes.length; i++) {
          if (listLikes[i].user.id === sessionStorage.getItem("userId")) {

            this.setState({

              isLike: true,
              likeId: listLikes[i].id

            });
          }
        }
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

    })

  }


  onLike(postId) {

    fetch("http://localhost:3001/likes", {

      method: 'POST',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      },

      body: JSON.stringify({
        "post_id": postId
      })

    }).then((data) => {
      return data.json()
    }).then((data) => {

      if (data.status === "success") {

        this.setState({ isLike: true, likeId: data.like_id });

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


  onDislike(likeId) {

    if (likeId) {

      fetch("http://localhost:3001/likes/" + likeId, {

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

          this.setState({isLike: false, likeId: null});

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

  }


  onClickOnUser() {

    const { user } = this.state.post;

    if (this.props.router)
      this.props.router.push({ pathname: '/user', state: { user } });

  }


  render() {

    const { isLike, post, likeId } = this.state;

    return (

      <li key={post.id} className="list-group-item" style={styles.postContainer}>
        <div>
          <div className="row">
            <span>
              <b className={(this.props.router ? " underline" : "")} style={styles.stylePostLogin} onClick={this.onClickOnUser}>
              {
                (post.user.firstname && post.user.lastname) ?

                  post.user.firstname + ' ' + post.user.lastname

                :

                  post.user.login
              }
              </b>
            <br/>
              <span style={{marginLeft: 15}}>
              {
                moment(post.created).format("DD MMMM YYYY HH:mm")
              }
              </span>
            </span>
            <span style={styles.actionButtons}>

              <button className={"btn btn-" + (isLike ? 'danger' : 'primary')} type="button" onClick={() => { isLike ? this.onDislike(likeId) : this.onLike(post.id)}}  style={styles.actionButton}>

                <i className="material-icons">{isLike ? 'thumb_down' : 'thumb_up'}</i>

              </button>


              <button className="btn btn-primary" type="button" data-toggle="modal" data-target={"#myCommentModal"} style={styles.actionButton} onClick={() => this.props.setModalComment(post)}>
                <i className="material-icons">comment</i>
              </button>

              {
                (post && post.user && post.user.id === sessionStorage.getItem("userId")) ?

                  <button className="btn btn-default" type="button" data-toggle="modal" data-target={"#myModal"} style={styles.actionButton} onClick={() => this.props.setModalPost(post)}>
                    <i className="material-icons">mode_edit</i>
                  </button>

                :

                  <span/>

              }

            </span>
          </div>
          <p style={styles.stylePostContent}>{post.content}</p>
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

  stylePostLogin: {

    fontSize: 20,
    marginLeft: 15
  }

};


Post.propTypes = {

  post: PropTypes.object.isRequired,
  router: PropTypes.object,

  displayAlert: PropTypes.func.isRequired,
  setModalPost: PropTypes.func,
  setModalComment: PropTypes.func.isRequired

};

Post.defaultProps = {
  setModalPost: () => {},
  router: null,
};