module.exports = async (db, Sequelize) => 
  db.define('Invoice', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoice: Sequelize.STRING,
    status: Sequelize.ENUM('LUNAS', 'BELUM LUNAS')
  }, {
      timestamps: false
    })

