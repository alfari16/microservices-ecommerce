const crypto = require('crypto')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/upload')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({ storage })
const { PRODUCT_ENDPOINT, USERAUTH_ENDPOINT } = require('./config/api_endpoint')

module.exports = app => {
  app.get('/', async (req, res) => {
    try {
      const page = Number(req.query.page || 1)
      const [home, popular] = await req.axios.all([
        req.axios.get(PRODUCT_ENDPOINT),
        req.axios.get(`${PRODUCT_ENDPOINT}/product-popular`)
      ])
      const {
        data: { data }
      } = home
      // console.log(home)
      res.render('home', {
        page,
        product: data.rows,
        popular: popular.data.data[0],
        totalCount: Number(data.count)
      })
    } catch (error) {
      console.error(error)
    }
  })

  /* profile */
  app.get('/profile', async (req, res) => {
    try {
      const {
        data: { data }
      } = await req.axios.get(`${USERAUTH_ENDPOINT}/profile`)
      res.render('profile', data)
    } catch (err) {
      res.json({
        isError: true,
        errorMsg: err.response ? err.response.errorMsg : 'error aja'
      })
      console.error(err)
    }
  })
  app.post('/profile', upload.single('photo'), async (req, res) => {
    try {
      const data = {
        ...req.body,
        password: crypto
          .createHash('sha256')
          .update(req.body.password)
          .digest('hex')
      }
      if (req.file) data.photoUrl = `/upload/${req.file.filename}`
      await req.axios.put(`${USERAUTH_ENDPOINT}/edit`, data)
      res.redirect('/profile')
    } catch (err) {
      console.error(err)
    }
  })

  /* user - authorization */
  app.get('/login', (req, res) => {
    const notLogin = req.query.notLogin
    const notFound = req.query.notFound
    res.render('login', { notLogin, notFound })
  })

  app.get('/logout', (req, res) => {
    req.session.token = null
    res.redirect('/login')
  })

  app.post('/login', async (req, res) => {
    try {
      const {
        data: { token }
      } = await req.axios.post(`${USERAUTH_ENDPOINT}/login`, {
        email: req.body.email,
        password: crypto
          .createHash('sha256')
          .update(req.body.password)
          .digest('hex')
      })
      req.session.token = token
      console.log(token)
      res.redirect('/')
    } catch (error) {
      if (error.response && error.response.status === 404) {
        res.redirect('/login?notFound=true')
      }
      console.error(error)
    }
  })

  app.get('/register', (req, res) => {
    const haveBeenUsed = req.query.haveBeenUsed
    res.render('register', { haveBeenUsed })
  })

  app.post('/register', async (req, res) => {
    try {
      // res.json(req.body)
      const {
        data: { token }
      } = await req.axios.post(`${USERAUTH_ENDPOINT}/register`, {
        nama: req.body.nama,
        email: req.body.email,
        password: crypto
          .createHash('sha256')
          .update(req.body.password)
          .digest('hex')
      })
      req.session.token = token
      console.log(token)
      res.redirect('/')
    } catch (error) {
      if (error.response && error.response.status === 403) {
        res.redirect('/register?haveBeenUsed=true')
      }
      console.error(error)
    }
  })
}
