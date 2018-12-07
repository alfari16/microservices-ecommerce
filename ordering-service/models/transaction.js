module.exports = async (db, Sequelize) =>
  db.define(
    'Transaction',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      productId: Sequelize.INTEGER,
      invoiceId: Sequelize.INTEGER,
      item: Sequelize.INTEGER,
      processed: Sequelize.BOOLEAN
    }
  )
