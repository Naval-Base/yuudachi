const Sequelize = require('sequelize');
const { join } = require('path');

const sequelize = new Sequelize(process.env.DB, {
	logging: false,
	operatorsAliases: false
});

sequelize.import(join(__dirname, '..', 'models', 'settings'));
sequelize.import(join(__dirname, '..', 'models', 'tags'));
sequelize.sync();

module.exports = sequelize;
