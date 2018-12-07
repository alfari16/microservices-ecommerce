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

const upload = require('./middleware/upload')

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
  app.post('/product/create', upload.single('photoUrl'), createProductPost)
  app.get('/product/create', createProduct)
  app.get('/product/:id', productDetail)
  app.get('/product/:id/delete', deleteProduct)
  app.post('/product/:id/edit', editProduct)

  /* transactions */
  app.use('/transaction', transaction)
}
