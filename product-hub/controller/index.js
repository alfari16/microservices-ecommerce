const product = require('./product')
const user = require('./user')

module.exports = (app) => {
  app.use('/products', product)
  app.use('/auth', user)
}