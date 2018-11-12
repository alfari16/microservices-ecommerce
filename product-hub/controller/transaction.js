const { Transaction, User, Invoice, sequelize } = require('../models/')
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
            userId: req.stateId
          },
          { transaction }
        )
        await Transaction.bulkCreate(
          req.body.items.map(el => ({
            productId: el.id,
            item: el.item,
            userId: req.stateId,
            invoiceId: id
          })),
          { transaction }
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

router.get('/all', isLoggedIn, async (req, res) => {
  try {
    const result = await Invoice.findAll({
      where: {
        lunas: req.query.status === 'lunas',
        userId: req.stateId
      }
    })
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

        const all = [
          User.update(
            {
              balance: Number(Number(balance) + sisa)
            },
            { where: { id: req.stateId }, transaction }
          ),
          Invoice.update(
            {
              lunas: req.body.value >= total,
              bayar: Math.min(req.body.value, total)
            },
            { where: { id: req.body.invoiceId }, transaction }
          )
        ]
        await Promise.all(all)

        res.json({ isOk: true })
      } catch (err) {
        console.error(err)
        res.json({ err, isError: true })
      }
    })
  }
)

module.exports = router
