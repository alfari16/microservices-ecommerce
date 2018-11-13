const product = require('./product')
const user = require('./user')
const transaction = require('./transaction')

module.exports = (app) => {
  app.use('/products', product)
  app.use('/auth', user)
  app.use('/orders', transaction)
}