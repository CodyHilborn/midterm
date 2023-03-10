///////////////////////////////////////////////////////////////////////////////////////////////////
//               SERVER CONFIG
///////////////////////////////////////////////////////////////////////////////////////////////////

// load .env data into process.env
require('dotenv').config();

// Web server config
const sassMiddleware = require('./lib/sass-middleware');
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');


const PORT = process.env.PORT || 8080;
const app = express();

app.set('view engine', 'ejs');

///////////////////////////////////////////////////////////////////////////////////////////////////
//               MIDDLEWARE
///////////////////////////////////////////////////////////////////////////////////////////////////

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_SESSION_SECRET]
}));

app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(
  '/styles',
  sassMiddleware({
    source: __dirname + '/styles',
    destination: __dirname + '/public/styles',
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static('public'));


///////////////////////////////////////////////////////////////////////////////////////////////////
//               ROUTER DEFINITIONS
///////////////////////////////////////////////////////////////////////////////////////////////////

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own

const usersRoutes = require('./routes/users');
const quizzesAPIroutes = require('./routes/quizzes-api');
const quizzesRoutes = require('./routes/quizzes');
const quizAttemptRoutes = require('./routes/quizAttempt');


///////////////////////////////////////////////////////////////////////////////////////////////////
//               ROUTER MOUNTING
///////////////////////////////////////////////////////////////////////////////////////////////////

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
// Note: Endpoints that return data (eg. JSON) usually start with `/api`

app.use('/users', usersRoutes);
app.use('/api/quizzes', quizzesAPIroutes);
app.use('/quizzes', quizzesRoutes);
app.use('/quizAttempt', quizAttemptRoutes);
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).


///////////////////////////////////////////////////////////////////////////////////////////////////
//               HOME PAGE ROUTING
///////////////////////////////////////////////////////////////////////////////////////////////////


// LANDING PAGE: REDIRECT TO SHOW ALL QUIZZES IF LOGGED IN;
app.get('/', (req, res) => {

  if (req.session.user_id) {
    return res.redirect('/quizzes');
  }

  return res.status(200).render('index');
});

///////////////////////////////////////////////////////////////////////////////////////////////////
//               ERROR HANDLER
///////////////////////////////////////////////////////////////////////////////////////////////////

app.all('*', (req, res) => {
  const templateVars = {errorMsg: '404 This is not the web page you are looking for'};
  res.status(404).render('errorhandle', templateVars);
});

///////////////////////////////////////////////////////////////////////////////////////////////////
//               SERVER LISTENER
///////////////////////////////////////////////////////////////////////////////////////////////////


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
