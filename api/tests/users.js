let request = require('supertest');

let { db, pgp } = require('../database');

function cleandb() {

  if (process.env.NODE_ENV === 'test') {

    db.none('DELETE FROM users');
    db.none('ALTER SEQUENCE users_id_seq RESTART WITH 1');

  }

}

describe('Testing users methods', function () {

  let server;
  let token, user_id;

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

  it('Register a new user no email', (done) => {
    request(server)
      .post('/register')
      .send({
        'login': 'userTest1',
        'password': 'fooBar'
      })
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Register a new user no login', (done) => {
    request(server)
      .post('/register')
      .send({
        'email': 'user@test.org',
        'password': 'fooBar'
      })
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Register a new user short password', (done) => {
    request(server)
      .post('/register')
      .send({
        'login': 'userTest2',
        'email': 'user2@test.org',
        'password': 'foo'
      })
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Register a new user duplicated login', (done) => {
    request(server)
      .post('/register')
      .send({
        'login': 'userTest',
        'email': 'user2@test.org',
        'password': 'fooBar'
      })
      .set('Accept', 'application/json')
      .expect(400, done);
  });

  it('Register a new user duplicated email', (done) => {
    request(server)
      .post('/register')
      .send({
        'login': 'user1Test',
        'email': 'user@test.org',
        'password': 'fooBar'
      })
      .set('Accept', 'application/json')
      .expect(400, done);
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

  it('Login with bad informations', (done) => {
    request(server)
      .post('/login')
      .send({
        'login': 'userTest',
        'password': 'fooBartol'
      })
      .set('Accept', 'application/json')
      .expect(401, done);
  });

  it('Update user good informations', (done) => {
    request(server)
      .put('/users/' + user_id)
      .set('Authorization', 'Bearer ' + token)
      .send({
        'login': 'userTest2',
      })
      .expect(200, done);
  });

  it('Update user bad login', (done) => {
    request(server)
      .put('/users/' + user_id)
      .set('Authorization', 'Bearer ' + token)
      .send({
        'login': 'user',
      })
      .expect(400, done);
  });

});
