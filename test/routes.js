
var request = require('supertest');
var should = require('should');

var config = require('./app/config.js');
var app = require('./app/app.js');
var adapter = require('lockit-couchdb-adapter')(config);

// use seperate config
var _config = JSON.parse(JSON.stringify(config));
_config.signup.route = '/signmeup';

// create app for this test
var _app = app(_config);

describe('# custom routes', function() {

  before(function(done) {
    // create a user only for this test
    adapter.save('route', 'custom@route.com', 'pass', done);
  });

  describe('GET /signup', function() {

    it('should use the route provided', function(done) {
      request(_app)
        .get('/signmeup')
        .end(function(error, res) {
          res.statusCode.should.equal(200);
          res.text.should.containEql('<div class="panel-heading">Signup</div>');
          done();
        });
    });

  });

  describe('POST /signup', function() {

    it('should use the route provided', function(done) {
      request(_app)
        .post('/signmeup')
        .send({name: '', email: 'some@email.com', password: 'secret'})
        .end(function(error, res) {
          // we get an error but not 404
          res.statusCode.should.equal(403);
          done();
        });
    });

  });

  describe('GET /signup/:token', function() {

    it('should render a success message when token is valid', function(done) {
      adapter.find('name', 'route', function(err, user) {
        request(_app)
          .get('/signmeup/' + user.signupToken)
          .end(function(error, res) {
            res.statusCode.should.equal(200);
            res.text.should.containEql('You can now use your credentials');
            done();
          });
      });
    });

  });

  describe('GET /signup/resend-verification', function() {

    it('should render template with email input', function(done) {
      request(_app)
        .get('/signmeup/resend-verification')
        .end(function(error, res) {
          res.statusCode.should.equal(200);
          res.text.should.containEql('Resend confirmation email');
          done();
        });
    });

  });

  describe('POST /signup/resend-verification', function() {

    it('should return an error when email has invalid format', function(done) {
      request(_app)
        .post('/signmeup/resend-verification')
        .send({email: 'someemail.com'})
        .end(function(error, res) {
          // 403 but not 404
          res.statusCode.should.equal(403);
          done();
        });
    });

  });

  after(function(done) {
    adapter.remove('route', done);
  });

});
