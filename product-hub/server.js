require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')

const db = require('./models/')
const router = require('./controller/index')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(logger('dev'))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Method', 'GET, POST, PUT, OPTIONS')
  next()
})

db.sync()
router(app)

app.listen(3000, () => {
  console.log('Product hub running on port 3000')
})
