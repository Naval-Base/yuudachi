const { db } = require('../struct/Database');
const Sequelize = require('sequelize');

const Case = db.define('cases', {
	case_id: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	ref_id: {
		type: Sequelize.INTEGER,
		allowNull: true
	},
	target_id: {
		type: Sequelize.STRING,
		allowNull: false
	},
	target_tag: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	guild: {
		type: Sequelize.STRING,
		allowNull: false
	},
	mod_id: {
		type: Sequelize.STRING,
		allowNull: true
	},
	mod_tag: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	message: {
		type: Sequelize.STRING,
		allowNull: true
	},
	reason: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	action: {
		type: Sequelize.INTEGER,
		allowNull: true
	},
	action_duration: {
		type: Sequelize.DATE,
		allowNull: true
	},
	action_processed: {
		type: Sequelize.BOOLEAN,
		defaultValue: true
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

module.exports = Case;
