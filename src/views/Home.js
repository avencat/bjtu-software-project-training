import React, { Component } from 'react';
import Nav from '../components/Navbar';
import Alert from '../components/Alert';
import PostModal from '../components/PostModal';
import CommentModal from '../components/CommentModal';


class Profile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      post: '',
      posts: [],
      putPost: '',
      listPosts: [],
      user: sessionStorage.getItem("userId"),
      flashStatus: '',
      flashTimer: 3000,
      flashMessage: '',
      showFlashMessage: false
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.fetchPosts = this.fetchPosts.bind(this);
    this.handleHideFlashMessage = this.handleHideFlashMessage.bind(this);
  }


  handleHideFlashMessage() {

    this.setState({

      flashStatus: '',
      flashMessage: '',
      showFlashMessage: false

    });

  }


  componentDidMount() {

    this.fetchPosts();

  }

  fetchPosts() {

    let stylePostLogin = {

      fontSize: 20

    };

    let stylePostContent = {

      fontSize: 21,
      marginTop: 10,
      WebkitHyphens: 'auto',
      MozHyphens: 'auto',
      msHyphens: 'auto',
      OHyphens: 'auto',
      hyphens: 'auto',
      wordWrap: 'break-word'

    };

    if (this.state.user) {

      fetch("http://localhost:3001/posts?user_id=" + sessionStorage.getItem("userId"), {

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

          const listPosts = data.data.map((onePost) =>
            <li key={onePost.id} className="list-group-item" style={styles.postContainer}>
              <div>
                <div className="row">
                  <PostModal
                    id={onePost.id}
                    post={onePost.content}

                    onModify={this.fetchPosts}
                  />
                  <b className="col-lg-10" style={stylePostLogin}>{(onePost.user.firstname && onePost.user.lastname) ? onePost.user.firstname + ' ' + onePost.user.lastname : onePost.user.login}</b>
                  <CommentModal
                    id={onePost.id}
                    post={onePost.content}
                    login={(onePost.user.firstname && onePost.user.lastname) ? onePost.user.firstname + ' ' + onePost.user.lastname : onePost.user.login}

                    onModify={this.fetchPosts}
                  />
                  <span style={styles.actionButtons}>
                    <button className="btn btn-primary" type="button" data-toggle="modal" data-target={"#myCommentModal" + onePost.id} style={styles.actionButton}>
                      <i className="material-icons">comment</i>
                    </button>
                    <button className="btn btn-default" type="button" data-toggle="modal" data-target={"#myModal" + onePost.id}>
                      <i className="material-icons">mode_edit</i>
                    </button>
                  </span>
                </div>
                <p style={stylePostContent}>{onePost.content}</p>
              </div>
            </li>
          );

          this.setState({
            posts: data.data,
            listPosts
          });

        }
      }).catch((err) => {
        console.log(err)
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
          showFlashMessage: true

        });

      }

    }).catch((err) => {

      this.setState({

        flashStatus: 'error',
        flashMessage: err.message || "Couldn't post, please try again later.",
        showFlashMessage: true

      });

      console.log(err)

    });
  }

  render() {

    const { post, listPosts, user, showFlashMessage, flashMessage, flashStatus, flashTimer } = this.state;

    var tmp = {
      alignItems: "center",
      display: "flex"
    };

    return (
      <div style={{position: 'relative'}}>

        <Alert
          visible={showFlashMessage}
          message={flashMessage}
          status={flashStatus}
          dismissTimer={flashTimer}
          onDismiss={this.handleHideFlashMessage}
        />

        <Nav location={this.props.location}/>

        <div className="col-sm-12">

          <div className="jumbotron">

            <h2 className="text-center">Home</h2>

            {
              user ?

                <form onSubmit={this.onSubmit}>

                  <div className="form-group" style={tmp}>

                    <div className="col-lg-10">
                      <input placeholder="What's new?" required={true} className="form-control" value={post} name='post' id="post" onChange={this.onChange}/>
                    </div>

                    <div className="col-lg-1">
                      <input className="btn btn-lg btn-primary" type="submit" value="Submit"/>
                    </div>

                  </div>

                </form>

              :

                <div/>
            }

            <div>
              <ul className="list-group">
                {listPosts}
              </ul>

            </div>

          </div>

        </div>

      </div>
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

  }

};

export default Profile;