const { Transaction, Product, User, Invoice, sequelize } = require('../models/')
const isLoggedIn = require('../middleware/login')
const joi = require('joi')
const validate = require('express-validation')
const router = require('express').Router()

router.post(
  '/create',
  validate({
    body: {
      items: joi
        .array()
        .items(
          joi.object().keys({
            id: joi.number().required(),
            item: joi.number().required(),
            total: joi.number().required()
          })
        )
        .required()
    },
    options: {
      allowUnknownBody: false
    }
  }),
  isLoggedIn,
  (req, res) => {
    sequelize.transaction(async transaction => {
      try {
        const total = req.body.items.reduce((prev, curr) =>
          Number(prev.total + curr.total)
        )
        const { id } = await Invoice.create(
          {
            invoice: `INV-${Date.now()}`,
            total,
            buyerId: req.stateId
          },
          { transaction }
        )
        await Transaction.bulkCreate(
          req.body.items.map(el => ({
            productId: el.id,
            item: el.item,
            invoiceId: id
          })),
          { transaction }
        )
        let allProduct = await Product.findAll({
          where: {
            id: {
              in: req.body.items.map(el => el.id)
            }
          },
          attributes: ['id', 'stock']
        })
        allProduct = allProduct.map(el => ({
          id: el.id,
          stock: el.stock
        }))
        await Promise.all(
          allProduct.map(el => {
            return Product.update(
              {
                stock:
                  el.stock -
                  req.body.items.find(inner => inner.id === el.id).item
              },
              {
                where: {
                  id: el.id
                },
                transaction
              }
            )
          })
        )
        res.json({ isOk: true })
      } catch (err) {
        res.json({ isError: true, err })
        console.error(err)
        // transaction.rollback()
      }
    })
  }
)

router.get('/allorder-buyer', isLoggedIn, async (req, res) => {
  try {
    const lunas = req.query.status === 'lunas'
    const result = await Invoice.findAll({
      where: {
        buyerId: req.stateId,
        total: lunas
          ? sequelize.col('Invoice.paid')
          : {
              [sequelize.Op.gt]: sequelize.col('Invoice.paid')
            }
      }
    })
    res.json({ isOk: true, result })
  } catch (err) {
    res.json({ isError: true, err })
    console.error(err)
  }
})

router.get('/allorder-seller', isLoggedIn, async (req, res) => {
  try {
    const result = await transactionLunas(req)
    res.json({ isOk: true, result })
  } catch (err) {
    res.json({ isError: true, err })
    console.error(err)
  }
})

router.post(
  '/transfer',
  isLoggedIn,
  validate({
    body: {
      invoiceId: joi.number().required(),
      value: joi.number().required()
    }
  }),
  async (req, res) => {
    sequelize.transaction(async transaction => {
      try {
        const { total } = await Invoice.findOne({
          where: { id: req.body.invoiceId }
        })

        const sisa = Math.max(0, req.body.value - total)
        const { balance } = await User.findOne({ where: { id: req.stateId } })

        await Promise.all([
          User.update(
            {
              balance: Number(Number(balance) + sisa)
            },
            { where: { id: req.stateId }, transaction }
          ),
          Invoice.update(
            {
              paid: Math.min(req.body.value, total)
            },
            { where: { id: req.body.invoiceId }, transaction }
          )
        ])

        res.json({ isOk: true })
      } catch (err) {
        console.error(err)
        res.json({ err, isError: true })
      }
    })
  }
)

router.post(
  '/process-order',
  isLoggedIn,
  validate({
    body: {
      transactionId: joi.number().required()
    }
  }),
  (req, res) => {
    sequelize.transaction(async transaction => {
      try {
        const { id } = await transactionLunas()
        await Transaction.update(
          {
            processed: true
          },
          {
            where: {
              id: req.body.transactionId,
              id: {
                in: id
              }
            },
            transaction
          }
        )
      } catch (error) {
        console.error(err)
        res.json({ err, isError: true })
      }
    })
  }
)

const transactionLunas = async req => {
  const processed = req.query.status === 'processed'
  const productId = await Product.findAll({
    attributes: ['id'],
    where: {
      userId: req.stateId
    }
  })
  return Transaction.findAll({
    where: {
      productId: {
        in: productId.map(el => el.id)
      },
      processed
    },
    include: [
      {
        model: Invoice,
        where: {
          total: {
            [sequelize.Op.eq]: sequelize.col('Invoice.paid')
          }
        },
        attributes: ['total', 'paid']
      }
    ]
  })
}
module.exports = router
