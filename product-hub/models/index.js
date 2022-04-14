require('dotenv').config()
const Sequelize = require('sequelize')
// const productModel = require('./product')
// const userModel = require('./user')
const transactionModel = require('./transaction')

const db = new Sequelize({
  host: process.env.HOST,
  username: process.env.DB_ATTR,
  // password: process.env.DB_ATTR,
  database: process.env.DATABASE,
  dialect: 'mysql'
})

transactionModel(db, Sequelize)

const User = db.define(
  'User',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama: Sequelize.STRING,
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    password: Sequelize.STRING,
    balance: Sequelize.STRING,
    photoUrl: Sequelize.STRING
  },
  {
    timestamps: false
  }
)

const Product = db.define(
  'Product',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama: Sequelize.STRING,
    harga: Sequelize.STRING,
    stock: Sequelize.INTEGER,
    userId: Sequelize.INTEGER,
    photoUrl: Sequelize.STRING
  },
  {
    timestamps: false
  }
)

User.hasMany(Product, {
  foreignKey: 'userId',
  as: 'seller'
})

Product.belongsTo(User, {
  foreignKey: 'userId',
  as: 'seller'
})

Product.hasMany(db.models.Transaction, {
  foreignKey: 'productId'
})

db.models.Transaction.belongsTo(Product, {
  foreignKey: 'productId'
})

module.exports = {
  sync: args => db.sync(args),
  sequelize: db,
  Product: db.models.Product,
  User: db.models.User,
  Transaction: db.models.Transaction
}
