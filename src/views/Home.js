import React, { Component } from 'react';
import Nav from '../components/Navbar';

class Profile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      post: '',
      posts: []
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }


  componentDidMount() {
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
        console.log(data)

        if (data.status === "success") {
        this.setState({
          posts: data.post
        });

        }
    }).catch((err) => {
      console.log(err)
    });
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
        console.log(data)
      }

    }).catch((err) => {

      console.log(err)

    });
  }

  render() {

    const { post, posts } = this.state;

    var stylePostLogin = {
      fontSize: 20
    }

    var stylePostContent = {
      fontSize: 14
    }

    var tmp = {
      alignItems: "center",
      display: "flex"
    }

    const listPosts = posts.map((onePost) =>
      <li key={onePost.id} className="list-group-item">
        <div>
            <b style={stylePostLogin}>{onePost.user.login}</b>
            <p style={stylePostContent}>{onePost.content}</p>
        </div>
      </li>
    );

    return (
      <div>

        <Nav location={this.props.location}/>

        <div className="col-sm-12">

          <div className="jumbotron">

            <h2 className="text-center">Home</h2>

            <form onSubmit={this.onSubmit}>

              <div className="form-group" style={tmp}>

                <div className="col-lg-10">
                  <input placeholder="What's new ?" required={true} className="form-control" value={post} name='post' id="post" onChange={this.onChange}/>
                </div>

                <div className="col-lg-1">
                  <input className="btn btn-lg btn-success" type="submit" value="Submit"/>
                </div>

              </div>

            </form>
            <div>
              <ul  className="list-group">
                {listPosts}
              </ul>

            </div>

          </div>

        </div>

      </div>
    );
  }
}

export default Profile;