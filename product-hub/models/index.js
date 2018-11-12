const Sequelize = require('sequelize')
const userModel = require('./user')
const productModel = require('./product')
const transactionModel = require('./transaction')
const invoiceModel = require('./invoice')

const db = new Sequelize({
  host: 'localhost',
  username: 'root',
  password: 'root',
  database: 'ecommerce',
  dialect: 'mysql'
})

const User = userModel(db, Sequelize)
const Product = productModel(db, Sequelize)
const Transaction = transactionModel(db, Sequelize)
const Invoice = invoiceModel(db, Sequelize)

module.exports = {
  sync: args => db.sync(args),
  sequelize: db,
  User: db.models.User,
  Product: db.models.Product,
  Transaction: db.models.Transaction,
  Invoice: db.models.Invoice
}