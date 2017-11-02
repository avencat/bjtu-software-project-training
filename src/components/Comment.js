import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class Comment extends Component {


  constructor(props) {
    super(props);

    this.state = {

      editing: false,
      comment: this.props.comment || {},
      content: this.props.comment ? this.props.comment.content : ''

    };

    this.onDelete = this.onDelete.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);

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
        //this.props.onModify();

      }

    }).catch((err) => {
      console.log(err)
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

          window.location.reload();
          // TODO Remplacer reload par un appel au serveur du parent et remplacer la liste des commentaires
          //this.props.onModify();

        }
      }).catch((err) => {
        console.log(err)
      });

    }

  }


  toggleEdit() {

    this.setState({

      editing: !this.state.editing

    });

  }


  render() {

    const { comment, editing, content } = this.state;

    return (

      <li className="list-group-item">

        <div>

          <div className="row" style={styles.commentContainer}>

            <b>
              {
                (comment.user.firstname && comment.user.lastname) ?

                  comment.user.firstname + ' ' + comment.user.lastname

                :

                  comment.user.login
              }
            </b>

            {

              editing ?

                <div>

                  <textarea

                    id="content"
                    name="content"
                    value={content}
                    className="col-lg-8"
                    style={styles.textArea}
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

                  <button

                    type="button"
                    style={styles.editButton}
                    className="btn btn-default"

                    onClick={this.toggleEdit}

                  >

                    <i className="material-icons">mode_edit</i>

                  </button>

                  <p style={styles.paragraph}>{ content }</p>

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

};