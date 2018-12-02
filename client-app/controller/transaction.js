const { ORDERING_ENDPOINT } = require('../config/api_endpoint')
const moment = require('moment')
const router = require('express').Router()

moment.locale('id')

router.get('/', async (req, res) => {
  try {
    let {
      data: { data }
    } = await req.axios.get(`${ORDERING_ENDPOINT}/allorder-buyer`)
    data = data.map(el => ({
      ...el,
      createdAt: moment(el.createdAt).format('DD MMM YYYY'),
      updatedAt: moment(el.updatedAt).format('DD MMM YYYY'),
      lunas: el.paid === el.total
    }))
    console.log(data)
    res.render('transaction-buy', { data })
  } catch (err) {
    console.error(err)
    res.json({ err })
  }
})
router.get('/done', async (req, res) => {
  try {
    let {
      data: { data }
    } = await req.axios.get(`${ORDERING_ENDPOINT}/allorder-buyer?status=lunas`)
    data = data.map(el => ({
      ...el,
      createdAt: moment(el.createdAt).format('DD MMM YYYY'),
      updatedAt: moment(el.updatedAt).format('DD MMM YYYY'),
      lunas: el.paid === el.total
    }))
    console.log(data)
    res.render('transaction-buy', { data })
  } catch (err) {
    console.error(err)
    res.json({ err })
  }
})
router.get('/ordered', async (req, res) => {
  try {
    let {
      data: { data }
    } = await req.axios.get(`${ORDERING_ENDPOINT}/allorder-buyer?status=lunas`)
    data = data.map(el => ({
      ...el,
      createdAt: moment(el.createdAt).format('DD MMM YYYY'),
      updatedAt: moment(el.updatedAt).format('DD MMM YYYY'),
      lunas: el.paid === el.total
    }))
    console.log(data)
    res.render('transaction-buy', { data })
  } catch (err) {
    console.error(err)
    res.json({ err })
  }
})
router.get('/processed', async (req, res) => {
  try {
    let {
      data: { data }
    } = await req.axios.get(`${ORDERING_ENDPOINT}/allorder-buyer?status=lunas`)
    data = data.map(el => ({
      ...el,
      createdAt: moment(el.createdAt).format('DD MMM YYYY'),
      updatedAt: moment(el.updatedAt).format('DD MMM YYYY'),
      lunas: el.paid === el.total
    }))
    console.log(data)
    res.render('transaction-buy', { data })
  } catch (err) {
    console.error(err)
    res.json({ err })
  }
})

module.exports = router