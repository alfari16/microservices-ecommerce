require('dotenv').config()
const { User } = require('../models/')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const joi = require('joi')
const validate = require('express-validation')

const isLoggedIn = (req, res, next) => {
  const auth = req.headers.authorization.split(' ')[1]
  try {
    const { id } = jwt.verify(auth, process.env.SECRET)
    req.stateId = id
  } catch (err) {
    return res.status(401).json({ isError: true, err })
  }
  next()
}

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
          .status(403)
          .json({ errorMsg: 'Email already taken', isError: true })
      const user = await User.create(req.body)
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        process.env.SECRET,
        {
          expiresIn: '360d'
        }
      )
      res.json({ isOk: true, token })
    } catch (err) {
      res.status(500).json({ err, isError: true })
      console.error(err)
    }
  }
)

router.get(
  '/profile',
  validate({
    headers: {
      authorization: joi
        .string()
        .regex(/^Bearer.+/)
        .required()
    }
  }),
  isLoggedIn,
  async (req, res) => {
    try {
      const data = await User.findOne({
        where: {
          id: req.stateId
        },
        attributes: {
          exclude: ['password']
        }
      })
      res.json({ isOk: true, data })
    } catch (err) {
      res.json({ isError: true, err })
    }
  }
)

router.put(
  '/edit',
  isLoggedIn,
  validate({
    body: {
      password: joi.string().required()
    }
  }),
  async (req, res) => {
    try {
      const find = await User.findOne({
        where: {
          id: req.stateId,
          password: req.body.password
        }
      })
      if (!find)
        return res
          .status(404)
          .json({ isError: true, errorMsg: 'User not found' })
      await User.update(req.body, {
        where: {
          id: req.stateId,
          password: req.body.password
        }
      })
      res.json({ isOk: true })
    } catch (err) {
      res.status(500).json({ isError: true })
    }
  }
)

module.exports = router
