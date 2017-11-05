import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';

export default class PostModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      putPost: this.props.post
    };

    this.onModify = this.onModify.bind(this);
    this.moveCaretAtEnd = this.moveCaretAtEnd.bind(this);
  }


  componentWillReceiveProps(newProps) {

    if (newProps.id !== this.props.id) {
      this.setState({putPost: newProps.post});
      setTimeout(() => {this.textarea.focus()}, 600);
    }

  }


  moveCaretAtEnd(e) {
    let temp_value = e.target.value;
    e.target.value = '';
    e.target.value = temp_value
  }


  onChange(e) {
    // Because we named the inputs to match their corresponding values in state, it's
    // super easy to update the state
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  }


  onModify(e) {

    e.preventDefault();

    fetch("http://localhost:3001/posts/" + this.props.id, {

      method: 'PUT',

      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
      },

      body: JSON.stringify({
        "content": this.state.putPost
      })

    }).then((data) => {
      return data.json()
    }).then((data) => {

      if (data.status === "success") {

        this.buttonClose.click();
        this.props.onModify();
        this.props.displayAlert(
          "Post " + this.props.id + " successfully updated",
          "success",
          5000
        );

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

    fetch("http://localhost:3001/posts/" + this.props.id, {

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
        this.buttonClose.click();
        this.props.displayAlert(
          "Post " + this.props.id + " successfully removed",
          "success",
          5000
        );

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
    return (

      <div className="modal fade" id={"myModal"} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close" ref={button => this.buttonClose = button}><span aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">Modify your post {this.props.id}</h4>
            </div>
            <form onSubmit={this.onModify} id={'myForm'}>
              <div className="modal-body" style={styles.modalBody}>
                <Textarea value={this.state.putPost} name="putPost" form={'myForm'} id="putPost" onChange={this.onChange.bind(this)} style={styles.inputStyle} inputRef={textarea => this.textarea = textarea} onFocus={this.moveCaretAtEnd}/>
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" type="button" style={styles.deleteButton}><i className="material-icons" onClick={this.onDelete.bind(this)}>delete</i></button>
                <button className="btn btn-primary" type="submit" value="Submit">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  };
}


const styles = {

  deleteButton: {

    paddingBottom: 3

  },

  inputStyle: {

    border: 'none',
    fontSize: 21,
    fontWeight: 200,
    minHeight: 75,
    maxWidth: '100%',
    outline: 'none',
    padding: '0px 15px',
    resize: 'none',
    width: '100%'

  },

  modalBody: {

    padding: 0

  }

};


PostModal.propTypes = {

  post: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,

  onModify: PropTypes.func.isRequired,
  displayAlert: PropTypes.func.isRequired

};
