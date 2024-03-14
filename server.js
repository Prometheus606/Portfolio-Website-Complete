require("dotenv").config()

const express = require("express")
const path = require("path")
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const i18n = require('i18n');
const passport = require('passport');
const morgan = require('morgan');
const helmet = require("helmet")
const methodOverride = require("method-override")

i18n.configure({
    locales: ['en', 'de'],
    defaultLocale: 'en',
    directory: __dirname + '/locales',
  });

const app = express()
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(express.json());
app.use(i18n.init);
app.use(express.urlencoded({extended: false, limit: "10mb"}))
app.use(methodOverride("_method"))
app.use(express.json({limit: "10mb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


// Middleware-Funktion, um die richtigen Pfade basierend auf dem angeforderten Ordner zu setzen
app.use((req, res, next) => {
  const application = req.originalUrl.split('/')[1]; // Erhalte den Namen des angeforderten Ordners aus der URL
  if (application) req.application = application
  next();
});

// Datebase
app.use(require("./model/db").connectDB) // Connect to the Database
app.use(require("./model/db").disconnectDB) // Disconnects from DB after res send

// Authentication
require('./Middleware/WhisperSphere/passport');
app.use(passport.initialize())
app.use(passport.session())



// setup helmet security 
const scriptSources = [
  "'self'",
  "blob:",
  "https://unpkg.com"
];

const styleSources = [
  "'self'",
  "https://unpkg.com",
  "https://unicons.iconscout.com",
  "https://cdn.jsdelivr.net",
  "https://cdnjs.cloudflare.com",
  "https://fonts.googleapis.com"
];
app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "defaultSrc": ["'self'"],
          "script-src": scriptSources,
          "style-src": styleSources,
          "img-src": ["'self'", "https: data:", "http: data:", "blob:", "data:", "application: data", "data: application"],
          "connectSrc": ["'self'"],
          "fontSrc": ["'self'", "https://unicons.iconscout.com", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
          "objectSrc": ["'none'"],
          "mediaSrc": ["'self'","application: data", "data: application"]
        },
      },
    })
  );

// use ether a IP limter (in Production), or use morgan logging
if (process.env.NODE_ENV === 'production') app.use(require("./Middleware/WhisperSphere//limiter"));
  else app.use(morgan('dev'))

// Whispersphere
app.use("/whispersphere", require("./routes/WhisperSphere/index"))
app.use("/whispersphere/auth", require("./routes/WhisperSphere/auth"))
app.use("/whispersphere/room", require("./routes/WhisperSphere/room"))

// Blog API
app.use("/blog-api/blog/", require("./routes/Blog_api/blog"))
app.use("/blog-api/auth", require("./routes/Blog_api/auth"))
app.use("/blog-api/search", require("./routes/Blog_api/search"))
app.use("/blog-api/comment", require("./routes/Blog_api/comment"))


// Mybrary
app.use("/mybrary", require("./routes/Mybrary/index"))
app.use("/mybrary/authors", require("./routes/Mybrary/author"))
app.use("/mybrary/books", require("./routes/Mybrary/books"))

// Portfolio website
app.use("/setlanguage", require("./routes/Portfolio/language"));
app.use("/contact", require("./routes/Portfolio/contact"));
app.use("/resume", require("./routes/Portfolio/resume"));
app.use("/portfolio", require("./routes/Portfolio/portfolio"));
app.use("/skills", require("./routes/Portfolio/skills"));
app.use("/", require("./routes/Portfolio/index"));

// use error handler
app.use(require("./Middleware/errorHandler"))

app.listen(process.env.PORT, () => {
    console.log(`Server is Listening.`);
})