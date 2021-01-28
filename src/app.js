import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

import methodOverride from 'method-override';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cors from 'cors';
import compression from 'compression';
import passport from 'passport';
import session from 'express-session';
import connectMongo from 'connect-mongo';

import passportConfig from './config/passport.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

import authRouter from './routes/authRoutes.js';
import indexRouter from './routes/indexRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MongoStore = connectMongo(session);

const app = express();

app.enable('trust proxy');

// Config File
config({ path: 'config.env' });

// Passport Config
passportConfig(passport);

// Set Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

// Handlebars
app.engine(
  '.hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
  })
)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs')

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set Sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Don't create a session until something is stored
    cookie: { secure: true }, // Work with HTTPS
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set Cookie parser
app.use(cookieParser());

// Set security HTTP headers
app.use(helmet());

//Limit requests from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  messege: 'Too many requests from this IP, Please try again in an hour!'
});
app.use('/', limiter);

//Date sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

// Implement CORS
app.use(cors());

app.options('*', cors());

app.use(compression());

app.disable('x-powered-by');

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);

// When someone access route that does not exist
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Handling Global Errors
app.use(globalErrorHandler);

export default app;
