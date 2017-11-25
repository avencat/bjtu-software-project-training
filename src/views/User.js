import React, { Component } from 'react';
import Nav from '../components/Navbar';
import Alert from '../components/Alert';
import Post from '../components/Post';
import PostModal from '../components/PostModal';
import CommentModal from '../components/CommentModal';


export default class User extends Component {

  constructor(props) {
    super(props);

    let user = props.location.state && props.location.state.user;
    let user_id = (user && user.id) ? user.id : sessionStorage.getItem("userId");

    this.state = {
      post: '',
      posts: [],
      putPost: '',
      listPosts: [],
      modalPost: { id: 0, content: '' },
      modalComments: { id: 0, content: '', user: {} },
      user,
      user_id: user_id,
      flashStatus: '',
      flashTimer: 3000,
      flashMessage: '',
      showFlashMessage: false,
      followering: '',
      friendship_id: null
    };

    this.onChange = this.onChange.bind(this);
    this.onFollow = this.onFollow.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onUnfollow = this.onUnfollow.bind(this);
    this.fetchPosts = this.fetchPosts.bind(this);
    this.displayAlert = this.displayAlert.bind(this);
    this.setModalPostContent = this.setModalPostContent.bind(this);
    this.fetchUserInformations = this.fetchUserInformations.bind(this);
    this.handleHideFlashMessage = this.handleHideFlashMessage.bind(this);
    this.setModalCommentsContent = this.setModalCommentsContent.bind(this);
  }


  componentWillReceiveProps(newProps) {

    if (!newProps.location.state || !newProps.location.state.user || newProps.location.state.user.id !== this.state.user_id) {

      let user_id = (newProps.location.state && newProps.location.state.user && newProps.location.state.user.id) ? newProps.location.state.user.id : sessionStorage.getItem("userId");

      this.setState({
        user_id
      }, () => {

        this.fetchUserInformations();

      })

    }

  }


  handleHideFlashMessage() {

    this.setState({

      flashStatus: '',
      flashMessage: '',
      showFlashMessage: false

    });

  }


  componentDidMount() {

    this.fetchUserInformations();

  }


  fetchPosts() {

    if (this.state.user) {

      const url = "http://localhost:3001/posts?author_id=" + this.state.user.id;

      fetch(url, {

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

          const listPosts = data.data.map((onePost) => {

            if (onePost.id === this.state.modalPost.id) {

              this.setState({modalPost: onePost});

            }

            return (
              <Post
                post={onePost}
                key={onePost.id}
                setModalPost={this.setModalPostContent}
                setModalComment={this.setModalCommentsContent}
                displayAlert={this.displayAlert}
              />
            )
          });

          this.setState({
            posts: data.data,
            listPosts : []
          }, () => {

            this.setState({
              listPosts
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

        this.setState({

          flashStatus: 'danger',
          flashMessage: "Couldn't get posts, please try again later. If the error persists, please contact us at social@network.net",
          flashTimer: 10000,
          showFlashMessage: true

        });

      });

    }

  }


  fetchUserInformations() {

    if (this.state.user_id) {

      fetch("http://localhost:3001/users/" + this.state.user_id, {

        method: 'GET',

        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
        }

      }).then(data => {
        return (data.json());
      }).then(data => {

        if (data.status === "success") {

          this.setState({
            user: data.user,
            friendship_id: data.user.friendship_id,
            followering: ' (' + data.user.following_nb + ' following / ' + data.user.follower_nb + ' follower' + (parseInt(data.user.follower_nb, 10) > 1 ? 's)' : ')')
          }, () => {
            this.fetchPosts();
          });

        } else {

          this.displayAlert(

            data.message,
            'danger',
            10000

          );

        }

      }).catch(err => {

        this.setState({

          flashStatus: 'danger',
          flashMessage: "Couldn't get user informations, please try again later. If the error persists, please contact us at social@network.net",
          flashTimer: 10000,
          showFlashMessage: true

        });

      });

    }

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
    const { post } = this.state;

    fetch("http://localhost:3001/posts", {

      method: 'POST',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      },

      body: JSON.stringify({
        "content": post
      })

    }).then((data) => {

      return data.json()

    }).then((data) => {

      if (data.status === "success") {

        this.setState({

          flashStatus: 'success',
          flashMessage: 'Successfully posted',
          showFlashMessage: true,
          post: ''

        });

        this.fetchPosts();

      } else {

        this.displayAlert(

          data.message,
          'danger',
          10000

        );

      }

    }).catch((err) => {

      this.setState({

        flashStatus: 'danger',
        flashMessage: err.message || "Couldn't post, please try again later.",
        showFlashMessage: true

      });

    });

  }


  displayAlert(message = '', status = 'info', timer = 5000) {

    this.setState({

      showFlashMessage: true,
      flashMessage: message,
      flashStatus: status,
      flashTimer: timer

    });

  }


  setModalPostContent(modalPost) {

    this.setState({modalPost})

  }


  setModalCommentsContent(modalComments) {

    this.setState({modalComments});

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
        "following_id": this.state.user_id
      })

    }).then((data) => {
      return data.json()
    }).then((data) => {

      if (data.status === "success") {

        let friendship_id = data.friendship_id;

        this.setState({ friendship_id });

        this.fetchPosts();

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

        this.setState({ friendship_id, listPosts: [] });

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


  render() {

    const { listPosts, user, user_id, showFlashMessage, flashMessage, flashStatus, flashTimer, modalComments, followering, modalPost, post } = this.state;
    const logged_user_id = sessionStorage.getItem("userId");

    return (
      <div style={{position: 'relative'}}>

        <Alert
          visible={showFlashMessage}
          message={flashMessage}
          status={flashStatus}
          dismissTimer={flashTimer}
          onDismiss={this.handleHideFlashMessage}
        />

        <Nav location={this.props.location} router={this.props.router} />

        <div className="col-sm-12">

          <div className="jumbotron" style={{position: 'relative'}}>

            {
              user_id !== logged_user_id &&

              <span style={styles.actionButtons}>

                <button className={"btn btn-" + (this.state.friendship_id ? 'danger' : 'primary')} type="button" onClick={() => { this.state.friendship_id ? this.onUnfollow() : this.onFollow()}}>

                  {this.state.friendship_id ? 'Unfollow' : 'Follow'}

                </button>

              </span>
            }

            <h2 className="text-center">
              {
                ((user && user.firstname && user.lastname) ?

                  (user.firstname + ' ' + user.lastname)

                :

                  user && user.login)

                + followering
              }
            </h2>

            {
              user_id &&

                <span>

                  {
                    user_id === logged_user_id &&

                    <form onSubmit={this.onSubmit}>

                      <div className="form-group" style={styles.postPostContainer}>

                        <div className="col-lg-10">
                          <input placeholder="What's new?" required={true} className="form-control" value={post} name='post' id="post" onChange={this.onChange}/>
                        </div>

                        <div className="col-lg-1">
                          <input className="btn btn-lg btn-primary" type="submit" value="Submit"/>
                        </div>

                      </div>

                    </form>

                  }

                  <div>
                    <ul className="list-group">
                      {listPosts}
                    </ul>
                  </div>

                </span>
            }

          </div>

        </div>

        <PostModal
          id={modalPost.id}
          post={modalPost.content}

          onModify={this.fetchPosts}
          displayAlert={this.displayAlert}
        />

        <CommentModal
          id={modalComments.id}
          post={modalComments.content}
          login={(modalComments.user.firstname && modalComments.user.lastname) ? '' + modalComments.user.firstname + ' ' + modalComments.user.lastname : '' + modalComments.user.login}

          router={this.props.router}
          onModify={this.fetchPosts}
          displayAlert={this.displayAlert}
        />

      </div>
    );
  }
}

const styles = {

  actionButtons: {
    position: 'absolute',
    right: 10,
    top: 10,
  },

  postPostContainer: {

    alignItems: "center",
    display: "flex"

  }

};
