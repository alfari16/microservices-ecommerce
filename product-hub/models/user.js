module.exports = async (db, Sequelize) =>
  db.define(
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
      role: Sequelize.ENUM('USER', 'ADMIN'),
      photoUrl: Sequelize.STRING
    },
    {
      timestamps: false
    }
  )
