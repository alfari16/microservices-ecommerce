require('dotenv').config()
const Sequelize = require('sequelize')
const productModel = require('./product')

const db = new Sequelize({
  host: process.env.HOST,
  username: process.env.DB_ATTR,
  password: process.env.DB_ATTR,
  database: process.env.DATABASE,
  dialect: 'mysql'
})

productModel(db, Sequelize)

module.exports = {
  sync: args => db.sync(args),
  sequelize: db,
  Product: db.models.Product
}
