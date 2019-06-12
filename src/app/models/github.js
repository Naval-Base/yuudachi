const { db } = require('../struct/Database');
const Sequelize = require('sequelize');

const Github = db.define('github', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	login: {
		type: Sequelize.STRING,
		allowNull: false
	},
	user: {
		type: Sequelize.STRING,
		allowNull: false
	},
	guild: {
		type: Sequelize.STRING,
		allowNull: false
	},
	createdAt: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	},
	updatedAt: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	}
});

module.exports = Github;
