module.exports = async (db, Sequelize) =>
  db.define('Product', {
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
  }, {
    timestamps: false
  })
