
require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const session      = require('express-session');
const passport     = require('passport');
const cors         = require('cors');
const MongoStore   = require('connect-mongo')(session);

mongoose.Promise = Promise;
mongoose

.connect('mongodb://localhost/angular-backend', {useMongoClient: true})
  // .connect(`mongodb://localhost/${process.env.MONGODB_URI}`, {useMongoClient: true})
  .then(() => {
    console.log('Connected to Mongo!');
  }).catch(err => {
    console.error('Error connecting to mongo', err);
  });

const passportSetup = require('./config/passport');
passportSetup(passport);

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ["http://localhost:4200"]
}));

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

// Session setup
app.use(session({
  secret: 'angular-backend ',
  resave: true,
  saveUninitialized: true,  
  store: new MongoStore( { mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 2419200000}
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(
  (req, res, next) => {
    res.header('Access-Control-Allow-Credential', true);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if ('OPTIONS' == req.method) {
      res.send(200);
  } else {
      next();
  }
  }
);


const index = require('./routes/index');
app.use('/', index);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  res.sendfile(__dirname + '/public/index.html');
});


module.exports = app;