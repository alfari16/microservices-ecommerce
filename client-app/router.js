const profile = require('./controller/profile')
const transaction = require('./controller/transaction')
const {
  home,
  ownProduct,
  productDetail,
  deleteProduct,
  editProduct,
  createProduct,
  createProductPost
} = require('./controller/product')
const {
  getLogin,
  getLogout,
  getRegister,
  postLogin,
  postRegister
} = require('./controller/auth')
const isLoggedIn = require('./middleware/isLoggedIn')

const upload = require('./middleware/upload')

module.exports = app => {
  app.get('/', home)

  /* profile */
  app.use('/profile', isLoggedIn, profile)

  /* user - authorization */
  app.get('/login', getLogin)
  app.get('/logout', getLogout)
  app.post('/login', postLogin)
  app.get('/register', getRegister)
  app.post('/register', postRegister)

  /* products */
  app.get('/products', isLoggedIn, ownProduct)
  app.post('/product/create', isLoggedIn, upload.single('photoUrl'), createProductPost)
  app.get('/product/create', isLoggedIn, createProduct)
  app.get('/product/:id', isLoggedIn, productDetail)
  app.get('/product/:id/delete', isLoggedIn, deleteProduct)
  app.post('/product/:id/edit', isLoggedIn, editProduct)

  /* transactions */
  app.use('/transaction', isLoggedIn, transaction)
}
