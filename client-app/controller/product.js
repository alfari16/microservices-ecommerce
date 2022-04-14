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
    res.render('products', data)
  } catch (err) {
    res.json({ err })
  }
}

module.exports.productDetail = async (req, res) => {
  try {
    const id = req.params.id
    const {
      data: { data }
    } = await req.axios.get(PRODUCT_ENDPOINT + '/' + id)
    if (data.userId === res.locals.userId)
      return res.render('productOwnDetail', data)
    res.render('productDetail', data)
  } catch (err) {
    console.error(err)
  }
}

module.exports.createProduct = (req, res) => {
  try {
    res.render('createProduct')
  } catch (err) {
    console.error(err)
  }
}

module.exports.createProductPost = async (req, res) => {
  try {
    await req.axios.post(PRODUCT_ENDPOINT + '/create', {
      ...req.body,
      photoUrl: '/upload/' + req.file.filename
    })
    res.redirect('/products')
  } catch (err) {
    res.send(err)
    console.error(err)
  }
}

module.exports.deleteProduct = async (req, res) => {
  try {
    await req.axios.delete(`${PRODUCT_ENDPOINT}/${req.params.id}/delete`)
    res.redirect('/products')
  } catch (err) {
    res.send('Terdapat kesalahan')
    console.error(err)
  }
}

module.exports.editProduct = async (req, res) => {
  try {
    const data = { ...req.body }
    delete data.id
    await req.axios.put(`${PRODUCT_ENDPOINT}/${req.params.id}/edit`, data)
    res.redirect('/product/' + req.params.id)
  } catch (err) {
    res.send('Terdapat kesalahan ' + err)
    console.error(err)
  }
}
