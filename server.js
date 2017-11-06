var express = require('express')
var path = require('path')
var logger = require('morgan')
var compression = require('compression')
var methodOverride = require('method-override')
var session = require('express-session')
var flash = require('express-flash')
var bodyParser = require('body-parser')
var expressValidator = require('express-validator')
var dotenv = require('dotenv')

// Load environment variables from .env file
dotenv.load()

// Controllers
var homeController = require('./controllers/home')
var contactController = require('./controllers/contact')

var app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.set('port', process.env.PORT || 3000)
app.use(compression())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())
app.use(methodOverride('_method'))
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }))
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')))

app.route('/')
  .get(homeController.index)
  .post(homeController.shortenUrl)
app.route('/:id').get(homeController.redirect)
app.route('/contact')
  .get(contactController.contactGet)
  .post(contactController.contactPost)

// Production error handler
if (app.get('env') === 'production') {
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.sendStatus(err.status || 500)
  })
}

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

module.exports = app
