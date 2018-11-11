module.exports = async (db, Sequelize) =>
  db.define(
    'Transaction',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: Sequelize.INTEGER,
      productId: Sequelize.INTEGER,
      invoiceId: Sequelize.INTEGER,
      item: Sequelize.INTEGER,
      date: Sequelize.DATE
    },
    {
      timestamps: false
    }
  )
