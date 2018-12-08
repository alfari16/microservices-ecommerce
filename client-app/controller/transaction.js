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
      nama: el.Transactions[0].Product.nama,
      createdAt: moment(el.createdAt).format('DD MMM YYYY'),
      updatedAt: moment(el.updatedAt).format('DD MMM YYYY'),
      lunas: el.paid === el.total
    }))
    console.log(data)
    res.render('transaction-buyer', { data })
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
      nama: el.Transactions[0].Product.nama,
      createdAt: moment(el.createdAt).format('DD MMM YYYY'),
      updatedAt: moment(el.updatedAt).format('DD MMM YYYY'),
      lunas: el.paid === el.total,
      rejected: el.Transactions[0].processed === 2
    }))
    console.log(data)
    res.render('transaction-buyer', { data })
  } catch (err) {
    console.error(err)
    res.json({ err })
  }
})
router.get('/ordered', async (req, res) => {
  try {
    let {
      data: { data }
    } = await req.axios.get(`${ORDERING_ENDPOINT}/allorder-seller`)
    data = data.map(el => ({
      ...el,
      createdAt: moment(el.createdAt).format('DD MMM YYYY'),
      updatedAt: moment(el.updatedAt).format('DD MMM YYYY')
    }))
    console.log(data)
    res.render('transaction-seller', { data, isOrdered: true })
  } catch (err) {
    console.error(err)
    res.json({ err })
  }
})
router.get('/processed', async (req, res) => {
  try {
    let {
      data: { data }
    } = await req.axios.get(
      `${ORDERING_ENDPOINT}/allorder-seller?status=processed`
    )
    data = data.map(el => ({
      ...el,
      createdAt: moment(el.createdAt).format('DD MMM YYYY'),
      updatedAt: moment(el.updatedAt).format('DD MMM YYYY'),
      rejected: el.processed === 2
    }))
    console.log(data)
    res.render('transaction-seller', { data, isOrdered: false })
  } catch (err) {
    console.error(err)
    res.json({ err })
  }
})

router.post('/create', async (req, res) => {
  try {
    await req.axios.post(ORDERING_ENDPOINT + '/create', {
      items: [{ ...req.body }]
    })
    res.redirect('/transaction')
  } catch (err) {
    if (err && err.response) {
      res.redirect('/?error=' + err.response.data.errorMsg)
    } else {
      res.json({ error })
    }
    console.error(error)
  }
})

router.get('/process/:id', async (req, res) => {
  try {
    const result = await req.axios.post(ORDERING_ENDPOINT + '/process-order', {
      transactionId: req.params.id
    })
    setTimeout(() => {
      res.redirect('/transaction/processed')
    }, 5000)
  } catch (err) {
    res.send(err)
    console.error(err)
  }
})

router.get('/reject/:id', async (req, res) => {
  try {
    await req.axios.post(ORDERING_ENDPOINT + '/reject-order', {
      transactionId: req.params.id
    })
    setTimeout(() => {
      res.redirect('/transaction/processed')
    }, 5000)
  } catch (err) {
    res.send(err)
    console.error(err)
  }
})

module.exports = router
