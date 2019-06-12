const { db } = require('../struct/Database');
const Sequelize = require('sequelize');

const Tags = db.define('tags', {
	author: {
		type: Sequelize.STRING,
		allowNull: false
	},
	guild: {
		type: Sequelize.STRING,
		allowNull: false
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	aliases: {
		type: Sequelize.ARRAY(Sequelize.TEXT), // eslint-disable-line new-cap
		allowNull: true
	},
	hoisted: {
		allowNull: false,
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	uses: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0
	},
	last_modified: {
		allowNull: true,
		type: Sequelize.STRING
	},
	createdAt: {
		allowNull: false,
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	},
	updatedAt: {
		allowNull: false,
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	}
});

module.exports = Tags;
