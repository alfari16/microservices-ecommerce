require('dotenv').config()
const { Product, User, Transaction, sequelize } = require('../models/')
const router = require('express').Router()
const joi = require('joi')
const validate = require('express-validation')
const isLoggedIn = require('../middleware/login')

router.get('/', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10)
    const offset = Number(req.query.page || 0) * limit
    console.log(offset)

    const data = await Product.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: User,
          attributes: ['id', 'nama'],
          where: {
            id: sequelize.col('Product.userId')
          },
          as: 'seller'
        }
      ],
      where: {
        stock: {
          gt: 0
        }
      },
      order: [['id', 'DESC'], ['nama', 'ASC']]
    })
    console.log('all Product', data)
    res.json({ isOk: true, data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err, isError: true })
  }
})

router.get('/product-popular', async (req, res) => {
  try {
    const data = await sequelize.query(
      "SELECT COUNT('*') AS total, nama, harga, photoUrl, Products.id FROM `Transactions`, Products WHERE productId=Products.id GROUP BY productId ORDER BY total DESC LIMIT 3"
    )
    res.json({ isOk: true, data })
  } catch (err) {
    res.status(500).json({ isError: true, err })
  }
})

router.get('/own', isLoggedIn, async (req, res) => {
  try {
    const data = await Product.findAndCountAll({
      where: {
        userId: req.stateId
      }
    })
    res.json({ isOk: true, data })
  } catch (err) {
    res.json({ isError: true, err })
    console.error(err)
  }
})

router.post(
  '/create',
  isLoggedIn,
  validate({
    body: {
      nama: joi.string().required(),
      harga: joi.string().required(),
      stock: joi.string().required(),
      photoUrl: joi.string().required()
    },
    options: {
      allowUnknownBody: false
    }
  }),
  async (req, res) => {
    try {
      const body = req.body
      const data = await Product.create({ ...body, userId: req.stateId })
      res.json({ isOk: true, data })
    } catch (err) {
      console.error(err)
      res.status(500).json({ err, isError: true })
    }
  }
)

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const data = await Product.findOne({
      where: {
        id
      }
    })
    console.log('One Product', data)
    if (data) res.json({ isOk: true, data })
    else res.status(404).json({ isError: true, errorMsg: 'Product Not Found' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err, isError: true })
  }
})

router.put(
  '/:id/edit',
  isLoggedIn,
  validate({
    params: {
      id: joi.number().required()
    },
    body: {
      nama: joi.string().required(),
      harga: joi.string().required(),
      stock: joi.string().required(),
      photoUrl: joi.string()
    },
    options: {
      allowUnknownBody: false
    }
  }),
  async (req, res) => {
    try {
      const productId = Number(req.params.id)
      const userId = Number(req.stateId)

      const isProductValid = await Product
      const data = await Product.findOne({ where: { id: productId, userId } })
      console.log('Edit One Product', data)
      if (!data)
        return res
          .status(404)
          .json({ isError: true, errorMsg: 'Product Not Found' })
      else {
        const body = req.body
        const data = await Product.update(body, {
          where: {
            id: productId
          }
        })
        res.json({ isOk: true, data })
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({ err, isError: true })
    }
  }
)

router.delete(
  '/:id/delete',
  isLoggedIn,
  validate({
    params: {
      id: joi.number().required()
    }
  }),
  async (req, res) => {
    try {
      const validate = Product.findOne({
        where: {
          id: req.params.id,
          userId: Number(req.stateId)
        }
      })
      if (!validate)
        return res
          .status(404)
          .json({ isError: true, errorMsg: 'Product Not Found' })
      const data = await Product.destroy({
        where: {
          id: req.params.id,
          userId: Number(req.stateId)
        }
      })
      res.json({ isOk: true, data })
    } catch (error) {
      console.error(err)
      res.json({ isError: true, err })
    }
  }
)

module.exports = router
