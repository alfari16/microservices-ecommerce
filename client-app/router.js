const profile = require('./controller/profile')
const transaction = require('./controller/transaction')
const { home, ownProduct, productDetail } = require('./controller/product')
const { getLogin, getLogout, getRegister, postLogin, postRegister } = require('./controller/auth')

module.exports = app => {
  app.get('/', home)

  /* profile */
  app.use('/profile', profile)

  /* user - authorization */
  app.get('/login', getLogin)
  app.get('/logout', getLogout)
  app.post('/login', postLogin)
  app.get('/register', getRegister)
  app.post('/register', postRegister)

  /* products */
  app.get('/products', ownProduct)
  app.get('/product/:id', productDetail)

  /* transactions */
  app.use('/transaction', transaction)
}
