// server.js
module.exports = function(options) {
  'use strict';
  // set up ======================================================================
  // get all the tools we need
  var express = require('express');
  var expressApp = express();
  var port = process.env.PORT || 8080;
  var flash = require('connect-flash');

  var _ = require('lodash');

  var morgan = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var session = require('express-session');

  var App = require('./app.js');

  var application = new App(_.extend({
      app: expressApp,
      metaScanFile: __filename
    },
    options
  ));

  application.middlewares.passport = require('passport');

  // configuration ===============================================================
  //mongoose.connect(configDB.url); // connect to our database
  application.bootstrap(function() {

    // set up our express application
    expressApp.use(morgan('dev')); // log every request to the console
    expressApp.use(cookieParser()); // read cookies (needed for auth)
    expressApp.use(bodyParser()); // get information from html forms

    expressApp.set('view engine', 'ejs'); // set up ejs for templating
    expressApp.set('views', __dirname + '/views');

    // required for passport
    expressApp.use(session({
      secret: application.config.application.session.secret
    })); // session secret
    expressApp.use(application.middlewares.passport.initialize());
    expressApp.use(application.middlewares.passport.session()); // persistent login sessions
    expressApp.use(flash()); // use connect-flash for flash messages stored in session

    /**
     * @followRoute ./server.route.js
     */
    require('./server.route.js')(application); // load our routes and pass in our app and fully configured passport

    // launch ======================================================================
    try {
      expressApp.listen(port, function() {
        application.console.log('Server is listening on port ' + port);
      });
    } catch (error) {
      application.console.error('Port ' + port + ' is not free for use');
      throw error;
    }
  });
};
