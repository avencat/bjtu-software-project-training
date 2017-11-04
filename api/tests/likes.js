let request = require('supertest');

let { db, pgp } = require('../database');

function cleandb() {

  if (process.env.NODE_ENV === 'test') {

    db.none('DELETE FROM users');
    db.none('ALTER SEQUENCE users_id_seq RESTART WITH 1; ALTER SEQUENCE posts_id_seq RESTART WITH 1; ALTER SEQUENCE comments_id_seq RESTART WITH 1; ALTER SEQUENCE post_likes_id_seq RESTART WITH 1');

  }

}

describe('Testing post likes methods', function () {

  let server, token, user_id, post_id, like_id;

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

  it('Add a new post like with bad informations', (done) => {
    request(server)
      .post('/likes')
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Add a new post like with good informations', (done) => {
    request(server)
      .post('/likes')
      .send({
        post_id: post_id
      })
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(201, (err, res) => {

        if (res && res.body && res.body.like_id) {
          like_id = res.body.like_id;
        }

        done();

      });
  });

  it('Get likes of a post', done => {
    request(server)
      .get('/likes?post_id=' + post_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Delete a like', (done) => {
    request(server)
      .delete('/likes/' + like_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

});
