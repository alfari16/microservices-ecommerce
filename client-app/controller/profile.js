const { USERAUTH_ENDPOINT } = require('../config/api_endpoint')

const router = require('express').Router()
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

router.get('/', async (req, res) => {
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
router.post('/', upload.single('photo'), async (req, res) => {
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

module.exports = router
