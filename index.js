var express = require('express');
var path = require("path");
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3100
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var pub = __dirname + '/public';
// setup middleware
var app = express();
app.use(express.static(pub));

var v1 = require('./v1');
var v2 = require('./v2');
var v2 = require('./v3');
var v4 = require('./v4');
app.get('/', function(req, res, next) { v4.clock(req, res, next); });
app.get('/v1', function(req, res, next) { v1.clock(req, res, next); });
app.get('/v3', function(req, res, next) { v3.clock(req, res, next); });
app.get('/v4', function(req, res, next) { v4.clock(req, res, next); });

// change this to a better error handler in your code
// sending stacktrace to users in production is not good
app.use(function(err, req, res, next) {
    res.json(err.stack);
});

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    routes.notfound(req, res, next);
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

app.listen(server_port, server_ip_address, function() { 
  console.log('Newpix-O-Meter started on ' + server_ip_address + ":" + server_port + '. Node version: ' + process.version);
});
