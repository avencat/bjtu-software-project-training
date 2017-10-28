process.env.NODE_ENV = 'test';
let app = require('../app');

let server = app.listen(3002, function () {
  const port = server.address().port;
});

module.exports = server;
