import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class PostModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      putPost: this.props.post
    };

    this.onModify = this.onModify.bind(this);
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

      console.log(data);

      if (data.status === "success") {

        this.props.onModify();

      }
    }).catch((err) => {
      console.log(err)
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

      console.log(data);

      if (data.status === "success") {

        window.location.reload();

      }
    }).catch((err) => {
      console.log(err)
    });

  }


  render() {
    return (

      <div className="modal fade" id={"myModal" + this.props.id} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">Modify your post {this.props.id}</h4>
            </div>
            <form onSubmit={this.onModify} id={'myForm' + this.props.id}>
              <div className="modal-body" style={styles.modalBody}>
                <textarea value={this.state.putPost} name="putPost" form={'myForm' + this.props.id} id="putPost" onChange={this.onChange.bind(this)} style={styles.inputStyle} ref="input"/>
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
    height: 75,
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

};
