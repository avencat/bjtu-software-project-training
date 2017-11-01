import React, { Component } from 'react';
import Nav from '../components/Navbar';
import Alert from '../components/Alert';

class Profile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      post: '',
      posts: [],
      listPosts: [],
      user: sessionStorage.getItem("userId"),
      flashStatus: '',
      flashTimer: 3000,
      flashMessage: '',
      showFlashMessage: false
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
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

    let stylePostLogin = {
      fontSize: 20
    };

    let stylePostContent = {
      fontSize: 14
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
            <li key={onePost.id} className="list-group-item">
              <div>
                <b style={stylePostLogin}>{(onePost.user.firstname && onePost.user.lastname) ? onePost.user.firstname + ' ' + onePost.user.lastname : onePost.user.login}</b>
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
                      <input className="btn btn-lg btn-success" type="submit" value="Submit"/>
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

        <Alert
          visible={showFlashMessage}
          message={flashMessage}
          status={flashStatus}
          dismissTimer={flashTimer}
          onDismiss={this.handleHideFlashMessage}
        />

      </div>
    );
  }
}

export default Profile;