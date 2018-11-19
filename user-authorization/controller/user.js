require('dotenv').config()
const { User } = require('../models/')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const joi = require('joi')
const validate = require('express-validation')

router.post(
  '/login',
  validate({
    body: {
      email: joi
        .string()
        .email()
        .required(),
      password: joi.string().required()
    }
  }),
  async (req, res) => {
    try {
      const { email, password } = req.body
      const data = await User.findOne({
        where: {
          email,
          password
        },
        attributes: ['id', 'email']
      })
      if (data) {
        const token = jwt.sign(
          JSON.parse(JSON.stringify(data)),
          process.env.SECRET,
          {
            expiresIn: '360d'
          }
        )
        res.json({ token })
      } else res.status(404).json({ isError: true, errorMsg: 'User not found' })
    } catch (err) {
      res.status(500).json({ err, isError: true })
      console.error(err)
    }
  }
)
router.get('/check/:id', (req, res) => {
  res.json(jwt.verify(req.params.id, process.env.SECRET))
})

router.post(
  '/register',
  validate({
    body: {
      email: joi
        .string()
        .email()
        .required(),
      password: joi.string().required(),
      nama: joi.string().required(),
      photoUrl: joi.string()
    },
    options: {
      allowUnknownBody: false
    }
  }),
  async (req, res) => {
    try {
      const unique = await User.findOne({ where: { email: req.body.email } })
      if (unique)
        return res
          .status(500)
          .json({ errorMsg: 'Email already taken', isError: true })
      await User.create(req.body)

      res.json({ isOk: true })
    } catch (err) {
      res.status(500).json({ err, isError: true })
      console.error(err)
    }
  }
)

module.exports = router
