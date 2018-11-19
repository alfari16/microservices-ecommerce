require('dotenv').config()
const Sequelize = require('sequelize')
const userModel = require('./user')

const db = new Sequelize({
  host: process.env.HOST,
  username: process.env.DB_ATTR,
  password: process.env.DB_ATTR,
  database: process.env.DATABASE,
  dialect: 'mysql'
})

userModel(db, Sequelize)

module.exports = {
  sync: args => db.sync(args),
  sequelize: db,
  User: db.models.User
}
