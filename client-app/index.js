const express = require('express')
const axios = require('axios')
const {
  PRODUCT_ENDPOINT
} = require('./config/api_endpoint')

const app = express()

app.set('view engine', 'ejs')
app.use(express.static('./public'))

app.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1)
    const [home, popular] = await axios.all([
      axios.get(PRODUCT_ENDPOINT),
      axios.get(`${PRODUCT_ENDPOINT}/product-popular`)
    ])
    const {
      data: { data }
    } = home
    console.log(home)
    res.render('home', {
      page,
      product: data.rows,
      popular: popular.data.data[0],
      totalCount: Number(data.count)
    })
  } catch (error) {
    console.error(error)
  }
})

app.listen(8000, () => {
  console.log('client app running on port 8000')
})
