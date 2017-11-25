import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import moment from "moment/moment";

export default class Comment extends Component {


  constructor(props) {
    super(props);

    this.state = {

      editing: false,
      comment: this.props.comment || {},
      content: this.props.comment ? this.props.comment.content : '',
      isLike: false,
      likeId: null,
      logged_user_id: sessionStorage.getItem('userId')

    };


    this.onLike = this.onLike.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onDislike = this.onDislike.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.getListLikes = this.getListLikes.bind(this);
    this.onClickOnUser = this.onClickOnUser.bind(this);
    this.moveCaretAtEnd = this.moveCaretAtEnd.bind(this);
  }


  onChange(e) {

    const state = this.state;

    state[e.target.name] = e.target.value;

    this.setState(state);

  }


  onSubmit(e) {

    e.preventDefault();

    if (this.props.comment && this.state.content === this.props.comment.content) {

      this.toggleEdit();
      return ;

    }

    fetch("http://localhost:3001/comments/" + this.props.comment.id, {

      method: 'PUT',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      },

      body: JSON.stringify({
        "content": this.state.content
      })

    }).then((data) => {
      return data.json()
    }).then((data) => {

      if (data.status === "success") {

        this.toggleEdit();
        this.props.onModify();

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


  onDelete(e){

    e.preventDefault();

    if (window.confirm("Delete comment?")) {

      fetch("http://localhost:3001/comments/" + this.props.comment.id, {

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

          this.props.onModify();

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


  toggleEdit() {

    this.setState({

      editing: !this.state.editing

    }, () => {

      if (this.state.editing) {

        this.textarea.focus();
        this.setState({

          content: this.state.content

        })

      }

    });

  }

  getListLikes(commentId) {

    fetch("http://localhost:3001/likeComments?comment_id=" + commentId, {

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


  onLike(commentId) {

    fetch("http://localhost:3001/likeComments", {

      method: 'POST',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      },

      body: JSON.stringify({
        "comment_id": commentId
      })

    }).then((data) => {
      return data.json()
    }).then((data) => {

      if (data.status === "success") {

        this.setState({ isLike: true, likeId: data.comment_like_id });

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

      fetch("http://localhost:3001/likeComments/" + likeId, {

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

  componentDidMount() {

    this.getListLikes(this.state.comment.id);

  }


  moveCaretAtEnd(e) {
    let temp_value = e.target.value;
    e.target.value = '';
    e.target.value = temp_value
  }

  onClickOnUser() {

    const { user } = this.state.comment;

    if (this.props.router)
      this.props.router.push({ pathname: '/user', state: { user } });

  }


  render() {

    const { comment, editing, content, isLike, likeId } = this.state;

    return (

      <li className="list-group-item" style={styles.container}>

        <div>

          <div className="row" style={styles.commentContainer}>

            <span style={{ display: 'flex', flexDirection: 'column', paddingBottom: 3 }}>
              <b>
                {
                    (comment.user.firstname && comment.user.lastname) ?

                        comment.user.firstname + ' ' + comment.user.lastname

                        :

                        comment.user.login
                }
              </b>
              <span style={{fontSize: 11}}>
                {
                    moment(comment.created).format("DD MMMM YYYY HH:mm")
                }
              </span>
            </span>

            {

              editing ?

                <div>

                  <Textarea

                    id="content"
                    name="content"
                    value={content}
                    inputRef={textarea => this.textarea = textarea}
                    className="col-lg-8"
                    style={styles.textArea}
                    onFocus={this.moveCaretAtEnd}
                    placeholder="Write a comment"

                    onChange={this.onChange.bind(this)}

                  />

                  <span style={styles.editingButtons}>

                    <button

                      type="submit"
                      style={styles.button}
                      className="btn btn-danger"

                      onClick={this.onDelete}

                    >

                      <i className="material-icons">delete</i>

                    </button>

                    <button

                      type="submit"
                      style={styles.button}
                      className="btn btn-primary"

                      onClick={this.onSubmit}

                    >

                      <i className="material-icons">done</i>

                    </button>

                  </span>

                </div>

              :

                <div>

                  {
                    (comment && comment.user && comment.user.id === sessionStorage.getItem("userId")) ?

                      <button

                        type="button"
                        style={styles.editButton}
                        className="btn btn-default"

                        onClick={this.toggleEdit}

                      >

                        <i className="material-icons">mode_edit</i>

                      </button>

                  :

                    <span/>
                  }

                  <p style={styles.paragraph}>{ content }</p>

                  <button

                    type="button"
                    style={styles.actionButton}
                    className={"btn btn-" + (isLike ? 'danger' : 'primary')}

                    onClick={() => {

                      isLike ? this.onDislike(likeId) : this.onLike(comment.id);

                    }}

                  >

                    <i className="material-icons">{isLike ? 'thumb_down' : 'thumb_up'}</i>

                  </button>

                </div>

            }

          </div>

        </div>

      </li>

    );

  }


}


const styles = {

  button: {

    marginRight: 5,

  },

  commentContainer: {

    position: 'relative',
    padding: '10px 15px'

  },

  container: {

    borderLeft: "none",
    borderRadius: 0,
    borderRight: "none",

  },

  editButton: {

    position: 'absolute',
    right: 10,
    top: -5

  },

  editingButtons: {

    float: 'right',
    marginRight: 5,
    marginTop: 5

  },

  paragraph: {

    WebkitHyphens: 'auto',
    MozHyphens: 'auto',
    msHyphens: 'auto',
    OHyphens: 'auto',
    hyphens: 'auto',
    wordWrap: 'break-word'

  },

  textArea: {

    border: 'none',
    fontSize: 21,
    fontWeight: 200,
    height: 75,
    maxWidth: '100%',
    outline: 'none',
    padding: 0,
    resize: 'none',
    width: '100%'

  }

};


Comment.propTypes = {

  comment: PropTypes.object.isRequired,

  displayAlert: PropTypes.func.isRequired

};