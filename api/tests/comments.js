let request = require('supertest');

let { db, pgp } = require('../database');

function cleandb() {

  if (process.env.NODE_ENV === 'test') {

    db.none('DELETE FROM comments');
    db.none('DELETE FROM posts');
    db.none('DELETE FROM users');
    db.none('ALTER SEQUENCE users_id_seq RESTART WITH 1; ALTER SEQUENCE posts_id_seq RESTART WITH 1; ALTER SEQUENCE comments_id_seq RESTART WITH 1');

  }

}

describe('Testing comments methods', function () {

  let server, token, user_id, post_id, comment_id;

  before(cleandb);

  beforeEach('Clean server', function () {
    delete require.cache[require.resolve('./appTest')];
    server = require('./appTest');
  });

  afterEach(function (done) {
    server.close(done);
  });

  after(() => {
    cleandb();
    pgp.end();
  });

  it('Register a new user', (done) => {
    request(server)
      .post('/register')
      .send({
        'login': 'userTest',
        'email': 'user@test.org',
        'password': 'fooBar'
      })
      .set('Accept', 'application/json')
      .expect(201, done);
  });

  it('Login with good informations', (done) => {
    request(server)
      .post('/login')
      .send({
        'login': 'userTest',
        'password': 'fooBar'
      })
      .set('Accept', 'application/json')
      .expect(200, (err, res) => {
        if (res && res.body && res.body.token) {
          token = res.body.token;
          user_id = res.body.user_id;
        }
        done();
      });
  });

  it('Add a new post with good informations', (done) => {
    request(server)
      .post('/posts')
      .send({
        content: 'New post'
      })
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(201, (err, res) => {
        if (res && res.body && res.body.post_id) {
          post_id = res.body.post_id;
        }
        done();
      });
  });

  it('Add a new comment with good informations', (done) => {
    request(server)
      .post('/comments')
      .send({
        content: 'New comment',
        post_id: post_id
      })
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(201, (err, res) => {

        if (res && res.body && res.body.comment_id) {
          comment_id = res.body.comment_id;
        }

        done();

      });
  });

  it('Add a new comment with bad informations', (done) => {
    request(server)
      .post('/comments')
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Get comments of a post', done => {
    request(server)
      .get('/comments?post_id=' + post_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Get a specific comment', done => {
    request(server)
      .get('/comments/' + comment_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Update a comment with good informations', (done) => {
    request(server)
      .put('/comments/' + comment_id)
      .send({
        content: 'Newer comment'
      })
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Update a comment with bad informations', (done) => {
    request(server)
      .put('/comments/' + comment_id)
      .send({
        content: ''
      })
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Delete a comment', (done) => {
    request(server)
      .delete('/comments/' + comment_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

});
