import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class CommentModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      comment: '',
      listComment: [],
    };

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

    fetch("http://localhost:3001/comments", {

      method: 'POST',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      },

      body: JSON.stringify({
        "content": this.state.comment,
        "post_id": this.props.id
      })

    }).then((data) => {

      return data.json()

    }).then((data) => {

      console.log(data)

      if (data.status === "success") {

        window.location.reload()

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

  componentDidMount() {

    this.fetchComments();

  }

  fetchComments() {

    fetch("http://localhost:3001/comments?post_id=" + this.props.id, {

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

        console.log(data)

        const listComment = data.data.map((oneComment) =>
          <li key={oneComment.id} className="list-group-item">
            <div>
              <div className="row">
                <b>{ (oneComment.user.firstname && oneComment.user.lastname) ? oneComment.user.firstname + ' ' + oneComment.user.lastname : oneComment.user.login }</b>
                <p>{ oneComment.content }</p>
              </div>
            </div>
          </li>
        );

        this.setState({
          comment: data.data,
          listComment
        });

      }
    }).catch((err) => {
      console.log(err)
    });

  }

  render() {

    const { listComment } = this.state;

    return (

      <div className="modal fade" id={"myCommentModal" + this.props.id} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h3 className="modal-title">{this.props.login}</h3>
              <p>{this.props.post}</p>
            </div>
            <form onSubmit={this.onSubmit.bind(this)}>
              <div className="modal-body">
                <input className="col-lg-8" placeholder="Write a comment" name="comment" id="comment" onChange={this.onChange.bind(this)}/>
                <button className="btn btn-primary" type="submit" value="Submit">Submit</button>
              </div>
              <div>
                <ul className="list-group">
                  { listComment }
                </ul>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  };
}


CommentModal.propTypes = {
  login: PropTypes.string.isRequired,
  post: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,

};
