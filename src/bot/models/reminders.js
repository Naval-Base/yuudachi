module.exports = (sequelize, DataTypes) =>
	sequelize.define('reminders', {
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		user: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		channel: DataTypes.BIGINT,
		reason: DataTypes.STRING(1950), // eslint-disable-line new-cap
		trigger: {
			type: DataTypes.STRING,
			allowNull: false
		},
		triggers_at: {
			type: DataTypes.DATE,
			allowNull: false
		}
	}, {
		timestamps: false,
		indexes: [
			{ fields: ['user'] }
		]
	});
