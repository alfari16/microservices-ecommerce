const { PRODUCT_ENDPOINT } = require('../config/api_endpoint')

module.exports.home = async (req, res) => {
  try {
    const page = Number(req.query.page || 1)
    const [home, popular] = await req.axios.all([
      req.axios.get(PRODUCT_ENDPOINT),
      req.axios.get(`${PRODUCT_ENDPOINT}/product-popular`)
    ])
    const {
      data: { data }
    } = home
    // console.log(home)
    res.render('home', {
      page,
      product: data.rows,
      popular: popular.data.data[0],
      totalCount: Number(data.count)
    })
  } catch (error) {
    console.error(error)
  }
}

module.exports.ownProduct = async (req, res) => {
  try {
    const {
      data: { data }
    } = await req.axios.get(`${PRODUCT_ENDPOINT}/own`)
    console.log(data)
    res.render('products', data)
  } catch (err) {
    res.json({ err })
  }
}
