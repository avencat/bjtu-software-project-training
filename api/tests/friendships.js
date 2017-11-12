let request = require('supertest');

let { db, pgp } = require('../database');

function cleandb() {

  if (process.env.NODE_ENV === 'test') {

    db.none('DELETE FROM users');
    db.none('ALTER SEQUENCE users_id_seq RESTART WITH 1; ' +
      'ALTER SEQUENCE posts_id_seq RESTART WITH 1; ' +
      'ALTER SEQUENCE comments_id_seq RESTART WITH 1; ' +
      'ALTER SEQUENCE comment_likes_id_seq RESTART WITH 1');

  }

}

describe('Testing friendships methods', function () {

  let server, token, user_id, friendship_id;

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

  it('Register a second user', (done) => {
    request(server)
      .post('/register')
      .send({
        'login': 'userTest1',
        'email': 'user1@test.org',
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

  it('Follow someone', (done) => {
    request(server)
      .post('/friendships')
      .send({
        following_id: 2
      })
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(201, (err, res) => {
        if (res && res.body && res.body.friendship_id) {
          friendship_id = res.body.friendship_id;
        }
        done();
      });
  });

  it('Get the number of user a specific user follow', (done) => {
    request(server)
      .get('/followingNb?user_id=' + user_id)
      .set('Authorization', 'Bearer ' + token)
      .expect(200, done);
  });

  it('Get the number of user that follows a specific user', (done) => {
    request(server)
      .get('/followerNb?user_id=' + user_id)
      .set('Authorization', 'Bearer ' + token)
      .expect(200, done);
  });

  it('Follow someone with bad informations', (done) => {
    request(server)
      .post('/friendships')
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Get users you follow list', (done) => {
    request(server)
      .get('/friendships')
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('Get users you follow list not logged in', (done) => {
    request(server)
      .get('/friendships')
      .set('Accept', 'application/json')
      .expect(401, done);
  });

  it('Delete a friendship not logged in', (done) => {
    request(server)
      .delete('/friendships/' + friendship_id)
      .set('Accept', 'application/json')
      .expect(401, done);
  });

  it('Delete a friendship', (done) => {
    request(server)
      .delete('/friendships/' + friendship_id)
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json')
      .expect(200, done);
  });

});
