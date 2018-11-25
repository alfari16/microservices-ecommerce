const express = require('express')
const router = require('./router')
const session = require('express-session')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()

app.set('view engine', 'ejs')
app.use(
  session({
    expires: new Date(Date.now() + 30 * 86400 * 1000),
    secret: 'client-app ecommerce',
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
  console.log('SESSION', req.session)
  res.locals.isLoggedIn = !!req.session.token
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
