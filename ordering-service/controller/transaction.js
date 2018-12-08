const { Transaction, Product, User, Invoice, sequelize } = require('../models/')
const isLoggedIn = require('../middleware/login')
const joi = require('joi')
const validate = require('express-validation')
const router = require('express').Router()

const kue = require('kue')
const queue = kue.createQueue()

queue.process('order', (job, done) => {
  const { req } = job.data
  console.log('REQ', req)
  sequelize.transaction(async transaction => {
    try {
      let outOfStock = {
        bool: false,
        data: []
      }
      let allProduct = await Product.findAll({
        where: {
          id: {
            in: req.body.items.map(el => el.id)
          }
        },
        attributes: ['id', 'stock']
      })
      allProduct = allProduct.map(el => {
        if (el.stock < req.body.items.find(inner => inner.id === el.id).item) {
          outOfStock.bool = true
          outOfStock.data.push(el)
        }
        return {
          id: el.id,
          stock: el.stock
        }
      })

      //validation
      if (req.body.items.length > allProduct.length) {
        const notFound = req.items.length.filter(el =>
          allProduct.find(inner => inner.id === el.id)
        )
        const error = {
          errorMsg: 'Product not found',
          data: notFound
        }
        return done(JSON.stringify(error))
      }
      if (outOfStock.bool) {
        return done(
          JSON.stringify({
            errorMsg: 'Stuff out of Stock',
            data: outOfStock.data
          })
        )
      }

      const promise1 = Promise.all(
        allProduct.map(el => {
          return Product.update(
            {
              stock:
                el.stock - req.body.items.find(inner => inner.id === el.id).item
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

      const promise2 = new Promise(async resolve => {
        const total =
          req.body.items.length > 1
            ? req.body.items.reduce((prev, curr) =>
                Number(prev.total + curr.total)
              )
            : req.body.items[0].total
        const { id } = await Invoice.create(
          { invoice: `INV-${Date.now()}`, total, buyerId: req.stateId },
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
        resolve(true)
      })

      await Promise.all([promise1, promise2])
      done(null, 'ok')
    } catch (err) {
      done(err)
      console.error(err)
    }
  })
})

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
    const job = queue
      .create('order', {
        req: { body: req.body, stateId: req.stateId }
      })
      .on('failed', err => {
        res.json({
          isError: true,
          ...JSON.parse(err)
        })
        job.remove()
      })
      .on('complete', () => {
        res.json({ isOk: true })
        job.remove()
      })
      .save(err => {
        if (err) res.json({ isError: true, err })
      })
  }
)

router.get('/allorder-buyer', isLoggedIn, async (req, res) => {
  try {
    const lunas = req.query.status === 'lunas'
    const data = await Invoice.findAll({
      where: {
        buyerId: req.stateId,
        total: lunas
          ? {
              [sequelize.Op.eq]: sequelize.col('Invoice.paid')
            }
          : {
              [sequelize.Op.not]: sequelize.col('Invoice.paid')
            }
      },
      include: [
        {
          model: Transaction,
          where: {
            id: sequelize.col('Invoice.id')
          },
          attributes: ['id', 'productId', 'processed'],
          include: [
            {
              model: Product,
              where: {
                id: sequelize.col('Transactions.productId')
              },
              attributes: ['nama']
            }
          ]
        }
      ]
    })
    res.json({ isOk: true, data })
  } catch (err) {
    res.json({ isError: true, err })
    console.error(err)
  }
})

router.get('/allorder-seller', isLoggedIn, async (req, res) => {
  try {
    const data = await transactionLunas(req)
    res.json({ isOk: true, data })
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

        // const transaction = await Transaction.findOne({
        //   where: {
        //     invoiceId: req.body.invoiceId
        //   }
        // })

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
        const allTrans = await transactionLunas(req)
        const {
          id,
          Product: { harga },
          item
        } = allTrans.find(el => el.id === req.body.transactionId)

        if (!id)
          return res
            .status(404)
            .json({ isError: true, errorMsg: 'Transaction not found' })
        const balance = Number(harga) * Number(item)
        const balanceOrigin = Number(
          (await User.findOne({
            where: {
              id: req.stateId
            }
          })).balance
        )

        await Promise.all([
          Transaction.update(
            {
              processed: true
            },
            {
              where: {
                id: req.body.transactionId
              },
              transaction
            }
          ),
          User.update(
            {
              balance: balance + balanceOrigin
            },
            {
              where: {
                id: req.stateId
              },
              transaction
            }
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
  '/reject-order',
  isLoggedIn,
  validate({
    body: {
      transactionId: joi.number().required()
    }
  }),
  (req, res) => {
    sequelize.transaction(async transaction => {
      try {
        const allTrans = await transactionLunas(req)
        const {
          id,
          productId,
          item,
          Product: { harga },
          Invoice: { buyerId }
        } = allTrans.find(el => el.id === req.body.transactionId)

        if (!id)
          return res
            .status(404)
            .json({ isError: true, errorMsg: 'Transaction not found' })

        const { stock } = await Product.findOne({
          where: {
            id: productId
          }
        })

        const { balance } = await User.findOne({
          where: {
            id: buyerId
          }
        })

        await Promise.all([
          Transaction.update(
            { processed: 2 },
            { where: { id: req.body.transactionId }, transaction }
          ),
          Product.update(
            {
              stock: Number(stock) + Number(item)
            },
            {
              where: {
                id: productId
              },
              transaction
            }
          ),
          User.update(
            {
              balance: Number(balance) + Number(item) * Number(harga)
            },
            {
              where: {
                id: buyerId
              },
              transaction
            }
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
      processed: processed
        ? {
            [sequelize.Op.gte]: 1
          }
        : 0
    },
    include: [
      {
        model: Product,
        where: {
          id: sequelize.col('Transaction.productId')
        },
        attributes: ['nama', 'harga']
      },
      {
        model: Invoice,
        attributes: ['buyerId']
      }
    ]
  })
}
module.exports = router
