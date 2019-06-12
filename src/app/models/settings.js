const { db } = require('../struct/Database');
const Sequelize = require('sequelize');

const Setting = db.define('settings', {
	guildID: {
		type: Sequelize.STRING,
		primaryKey: true,
		allowNull: false
	},
	settings: {
		type: Sequelize.JSONB,
		allowNull: false,
		default: {}
	}
});

module.exports = Setting;
