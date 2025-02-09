const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false // Establece a true si quieres ver las consultas SQL
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;