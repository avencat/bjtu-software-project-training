let request = require('supertest');

let { db, pgp } = require('../database');

function cleandb() {

  if (process.env.NODE_ENV === 'test') {

    db.none('DELETE FROM posts');
    db.none('DELETE FROM users');
    db.none('ALTER SEQUENCE users_id_seq RESTART WITH 1; ALTER SEQUENCE posts_id_seq RESTART WITH 1');

  }

}

describe('Testing posts methods', function () {

  let server, token, user_id, post_id;

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

  it('Add a new post with bad informations', (done) => {
    request(server)
      .post('/posts')
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Get posts of himself', done => {
    request(server)
      .get('/posts?author_id=' + user_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Get all posts', done => {
    request(server)
      .get('/posts')
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Get all posts with comments', done => {
    request(server)
      .get('/posts/comments')
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Get all posts with comments of himself', done => {
    request(server)
      .get('/posts/comments?author_id=' + user_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Update a post with good informations', (done) => {
    request(server)
      .put('/posts/' + post_id)
      .send({
        content: 'Newer post'
      })
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Update a post with bad informations', (done) => {
    request(server)
      .put('/posts/' + post_id)
      .send({
        content: ''
      })
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Delete a post', (done) => {
    request(server)
      .delete('/posts/' + post_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

});
