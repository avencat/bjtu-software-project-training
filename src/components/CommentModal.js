import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Comment from "./Comment";
import Textarea from 'react-textarea-autosize';

export default class CommentModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      newComment: '',
      listComment: []
    };

    this.fetchComments = this.fetchComments.bind(this);
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
        "content": this.state.newComment,
        "post_id": this.props.id
      })

    }).then((data) => {

      return data.json()

    }).then((data) => {

      if (data.status === "success") {

        this.fetchComments();
        this.setState({
          newComment: ''
        });

      }

    }).catch((err) => {

      this.setState({

        flashStatus: 'error',
        flashMessage: err.message || "Couldn't post, please try again later.",
        showFlashMessage: true

      });

    });
  }

  componentWillReceiveProps(newProps) {

    if (newProps.id !== this.props.id) {
      this.setState({newComment: ''});
      this.fetchComments(newProps);
    }

    setTimeout(() => (this.textarea.focus()), 600);

  }

  fetchComments(props = this.props) {

    fetch("http://localhost:3001/comments?post_id=" + props.id, {

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

        const listComment = data.data.map((oneComment) =>
          <Comment comment={oneComment} key={oneComment.id} onModify={this.fetchComments} displayAlert={this.props.displayAlert} />
        );

        this.setState({
          listComment
        });

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

    const { listComment } = this.state;

    return (

      <div className="modal fade" id={"myCommentModal"} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h3 className="modal-title">{this.props.login}</h3>
              <p style={styles.paragraph}>{this.props.post}</p>
            </div>
            <div className="modal-body" style={styles.modalBody}>
              <form onSubmit={this.onSubmit.bind(this)} id={"myCommentModalForm"} style={styles.form}>
                <Textarea value={this.state.newComment} className="col-lg-8" placeholder="Write a comment" name="newComment" id="newComment" form={"myCommentModalForm"} onChange={this.onChange.bind(this)} style={styles.textArea} inputRef={textarea => this.textarea = textarea} />
                <button className="btn btn-primary" type="submit" value="Submit" style={styles.submitButton}>Submit</button>
              </form>
              <ul className="list-group">
                { listComment }
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  };
}


const styles = {

  form: {

    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    padding: 15

  },

  modalBody: {

    padding: 0

  },

  paragraph: {

    fontSize: 21,
    WebkitHyphens: 'auto',
    MozHyphens: 'auto',
    msHyphens: 'auto',
    OHyphens: 'auto',
    hyphens: 'auto',
    wordWrap: 'break-word'

  },

  submitButton: {

    width: 75

  },

  textArea: {

    border: 'none',
    marginBottom: 5,
    maxWidth: '100%',
    minHeight: '50px',
    outline: 'none',
    padding: '2px 0px',
    resize: 'none',
    width: '100%'

  }

};


CommentModal.propTypes = {

  login: PropTypes.string.isRequired,
  post: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,

  displayAlert: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired
};
