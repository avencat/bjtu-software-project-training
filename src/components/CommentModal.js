import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Comment from "./Comment";

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
          <Comment comment={oneComment} key={oneComment.id} />
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
              <p style={styles.paragraph}>{this.props.post}</p>
            </div>
            <form onSubmit={this.onSubmit.bind(this)} id={"myCommentModalForm" + this.props.id}>
              <div className="modal-body">
                <textarea className="col-lg-8" placeholder="Write a comment" name="comment" id="comment" form={"myCommentModalForm" + this.props.id} onChange={this.onChange.bind(this)} style={styles.textArea}/>
                <button className="btn btn-primary" type="submit" value="Submit" style={styles.submitButton}>Submit</button>
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


const styles = {

  paragraph: {

    WebkitHyphens: 'auto',
    MozHyphens: 'auto',
    msHyphens: 'auto',
    OHyphens: 'auto',
    hyphens: 'auto',
    wordWrap: 'break-word'

  },

  submitButton: {

    marginLeft: 15

  },

  textArea: {

    border: 'none',
    maxWidth: '100%',
    outline: 'none',
    resize: 'none',
    width: '100%'

  }

};


CommentModal.propTypes = {

  login: PropTypes.string.isRequired,
  post: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,

};
