let request = require('supertest');

let { db, pgp } = require('../database');

function cleandb() {

  if (process.env.NODE_ENV === 'test') {

    db.none('DELETE FROM users');
    db.none('ALTER SEQUENCE users_id_seq RESTART WITH 1; ALTER SEQUENCE posts_id_seq RESTART WITH 1; ALTER SEQUENCE comments_id_seq RESTART WITH 1; ALTER SEQUENCE comment_likes_id_seq RESTART WITH 1');

  }

}

describe('Testing comment likes methods', function () {

  let server, token, user_id, post_id, comment_id, comment_like_id;

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

  it('Register', (done) => {
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

  it('Login', (done) => {
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

  it('Add a post', (done) => {
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

  it('Add a new comment like with bad informations', (done) => {
    request(server)
      .post('/likeComments')
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Add a new comment like with good informations', (done) => {
    request(server)
      .post('/likeComments')
      .send({
        comment_id: comment_id
      })
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(201, (err, res) => {

        if (res && res.body && res.body.comment_like_id) {
          comment_like_id = res.body.comment_like_id;
        }

        done();

      });
  });

  it('Get likes of a comment', done => {
    request(server)
      .get('/likeComments?comment_id=' + comment_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Delete a like', (done) => {
    request(server)
      .delete('/likeComments/' + comment_like_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

});
