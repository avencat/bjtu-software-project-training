import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PostModal from './PostModal';
import CommentModal from './CommentModal';


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
            console.log(listLikes[i].user.id + " " + sessionStorage.getItem("userId"))

            this.setState({

              isLike: true,
              likeId: listLikes[i].id

            });
          }
        }
      }

    }).catch((err) => {
      console.log(err)
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

      console.log(data)

      if (data.status === "success") {

        this.setState({ isLike: true, likeId: data.like_id });

      }

    }).catch((err) => {
      console.log(err)
    });

  }


  onDislike(likeId) {

    if (!likeId) {

      console.log("Pas de likeId");
      return ;

    }

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

      console.log(data)

      if (data.status === "success") {

        this.setState({ isLike: false, likeId: null });

      }

    }).catch((err) => {
      console.log(err)
    });

  }


  render() {

    const { isLike, post, likeId } = this.state;

    return (

      <li key={post.id} className="list-group-item" style={styles.postContainer}>
        <div>
          <div className="row">
            <PostModal
              id={post.id}
              post={post.content}

              onModify={this.props.fetchPosts}
            />
            <b className="col-lg-10" style={styles.stylePostLogin}>{(post.user.firstname && post.user.lastname) ? post.user.firstname + ' ' + post.user.lastname : post.user.login}</b>
            <CommentModal
              id={post.id}
              post={post.content}
              login={(post.user.firstname && post.user.lastname) ? post.user.firstname + ' ' + post.user.lastname : post.user.login}

              onModify={this.props.fetchPosts}
            />
            <span style={styles.actionButtons}>

              <button className={"btn btn-" + (isLike ? 'danger' : 'primary')} type="button" onClick={() => { isLike ? this.onDislike(likeId) : this.onLike(post.id)}}>

                <i className="material-icons">{isLike ? 'thumb_down' : 'thumb_up'}</i>

              </button>


              <button className="btn btn-primary" type="button" data-toggle="modal" data-target={"#myCommentModal" + post.id} style={styles.actionButton}>
                <i className="material-icons">comment</i>
              </button>

              <button className="btn btn-default" type="button" data-toggle="modal" data-target={"#myModal" + post.id} style={styles.actionButton}>
                <i className="material-icons">mode_edit</i>
              </button>

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
    right: 10,
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

    fontSize: 20

  }

};


Post.propTypes = {

  post: PropTypes.object.isRequired,

  fetchPosts: PropTypes.func.isRequired

};
