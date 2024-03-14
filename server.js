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
    directory: __dirname + '/Portfolio/locales',
  });

const app = express()
app.set('view engine', 'ejs');
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

const folders = [
  {
      folderName: '',
      viewsPath: path.join(__dirname, 'Portfolio', 'views')
  },
  {
    folderName: 'whispersphere',
    viewsPath: path.join(__dirname, 'WhisperSphere', 'views')
  },
  {
    folderName: 'mybrary',
    viewsPath: path.join(__dirname, 'Mybrary', 'views')
  },
  {
    folderName: 'blog-api'
  }
];
// Middleware-Funktion, um die richtigen Pfade basierend auf dem angeforderten Ordner zu setzen
app.use((req, res, next) => {
  const requestedFolder = req.originalUrl.split('/')[1]; // Erhalte den Namen des angeforderten Ordners aus der URL
  const folder = folders.find(folder => folder.folderName === requestedFolder); // Finde den passenden Ordner
  if (folder) {
      app.set('views', folder.viewsPath);
      req.test = folder.folderName
    }
    next();
  });

// Datebase
app.use(require("./model/db").connectDB) // Connect to the Database
app.use(require("./model/db").disconnectDB) // Disconnects from DB after res send

// Authentication
require('./WhisperSphere/middleware/passport');
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
if (process.env.NODE_ENV === 'production') app.use(require("./Whispersphere/middleware/limiter"));
  else app.use(morgan('dev'))

// Whispersphere
app.use("/whispersphere", require("./whispersphere/routes/index"))
app.use("/whispersphere/auth", require("./whispersphere/routes/auth"))
app.use("/whispersphere/room", require("./whispersphere/routes/room"))

// Blog API
app.use("/blog-api/blog/", require("./Blog_api/routes/blog"))
app.use("/blog-api/auth", require("./Blog_api/routes/auth"))
app.use("/blog-api/search", require("./Blog_api/routes/search"))
app.use("/blog-api/comment", require("./Blog_api/routes/comment"))


// Mybrary
app.use("/mybrary", require("./Mybrary/routes/index"))
app.use("/mybrary/authors", require("./Mybrary/routes/author"))
app.use("/mybrary/books", require("./Mybrary/routes/books"))

// Portfolio website
app.use("/setlanguage", require("./Portfolio/routes/language"));
app.use("/contact", require("./Portfolio/routes/contact"));
app.use("/resume", require("./Portfolio/routes/resume"));
app.use("/portfolio", require("./Portfolio/routes/portfolio"));
app.use("/skills", require("./Portfolio/routes/skills"));
app.use("/", require("./Portfolio/routes/index"));

// use error handler
app.use(require("./errorHandler"))

app.listen(process.env.PORT, () => {
    console.log(`Server is Listening.`);
})