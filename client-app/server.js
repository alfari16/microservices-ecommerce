const express = require('express')
const router = require('./router')
const session = require('express-session')
const redis = require('redis')
const bodyParser = require('body-parser')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const redisStore = require('connect-redis')(session)

const app = express()
const client = redis.createClient()

app.set('view engine', 'ejs')
app.use(
  session({
    store: new redisStore({
      host: '127.0.0.1',
      port: '6479',
      disableTTL: true,
      client
    }),
    secret: 'keyboard cat',
    cookie: {
      expires: new Date(Date.now() + 30 * 86400 * 1000),
      maxAge: Date.now() + 30 * 86400 * 1000,
      secure: false
    },
    saveUninitialized: true,
    resave: true
  })
)
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.token
  res.locals.userId = null
  if (req.session.token) res.locals.userId = jwt.verify(req.session.token, 'cute cat').id
  axios.defaults.headers.common['Authorization'] = `Bearer ${req.session.token}`
  req.axios = axios
  next()
})
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('./public'))

router(app)

app.listen(8000, () => {
  console.log('client app running on port 8000')
})
