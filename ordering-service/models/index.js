require('dotenv')
const Sequelize = require('sequelize')
const userModel = require('./user')
const productModel = require('./product')
const transactionModel = require('./transaction')
const invoiceModel = require('./invoice')

const db = new Sequelize({
  host: process.env.HOST,
  username: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  dialect: 'mysql'
})

userModel(db, Sequelize)
productModel(db, Sequelize)
transactionModel(db, Sequelize)
invoiceModel(db, Sequelize)

db.models.Invoice.hasMany(db.models.Transaction, {
  foreignKey: 'invoiceId'
})

db.models.Transaction.belongsTo(db.models.Invoice, {
  foreignKey: 'invoiceId'
})

module.exports = {
  sync: args => db.sync(args),
  sequelize: db,
  User: db.models.User,
  Product: db.models.Product,
  Transaction: db.models.Transaction,
  Invoice: db.models.Invoice
}
