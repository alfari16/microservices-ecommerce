module.exports = async (db, Sequelize) =>
  db.define(
    'Invoice',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      invoice: Sequelize.STRING,
      lunas: Sequelize.BOOLEAN,
      total: Sequelize.STRING,
      bayar: Sequelize.STRING,
      userId: Sequelize.INTEGER
    },
    {
      timestamps: false
    }
  )

