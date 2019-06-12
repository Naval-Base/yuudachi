const { db } = require('../struct/Database');
const Sequelize = require('sequelize');

const Rolestate = db.define('roles', {
	user: {
		type: Sequelize.STRING,
		allowNull: false
	},
	guild: {
		type: Sequelize.STRING,
		allowNull: false
	},
	roles: {
		type: Sequelize.ARRAY(Sequelize.STRING), // eslint-disable-line new-cap
		allowNull: true
	}
});

module.exports = Rolestate;
