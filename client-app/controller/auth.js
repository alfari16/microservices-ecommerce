const { USERAUTH_ENDPOINT } = require('../config/api_endpoint')
const crypto = require('crypto')

const getLogin = (req, res) => {
  const notLogin = req.query.notLogin
  const notFound = req.query.notFound
  console.log('*********************** notLogin ***********************', notLogin);
  console.log('*********************** notFound ***********************', notFound);
  res.render('login', { notLogin, notFound })
}

const getLogout = (req, res) => {
  req.session.token = null
  res.redirect('/login')
}

const postLogin = async (req, res) => {
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
    res.redirect('/')
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.redirect('/login?notFound=true')
    }
    console.error(error)
  }
}

const getRegister = (req, res) => {
  const haveBeenUsed = req.query.haveBeenUsed
  res.render('register', { haveBeenUsed })
}

const postRegister = async (req, res) => {
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
    res.redirect('/')
  } catch (error) {
    if (error.response && error.response.status === 403) {
      res.redirect('/register?haveBeenUsed=true')
    }
    console.error(error)
  }
}

module.exports = {
  getLogin,
  postLogin,
  getLogout,
  getRegister,
  postRegister
}
