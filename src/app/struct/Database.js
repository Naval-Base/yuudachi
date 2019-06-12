const Logger = require('../util/logger');
const path = require('path');
const readdir = require('util').promisify(require('fs').readdir);
const Sequelize = require('sequelize');

const db = new Sequelize(process.env.POSTGRES, {
	logging: false
});

class Database {
	static get db() {
		return db;
	}

	static async authenticate() {
		try {
			await db.authenticate();
			Logger.info('Amazon RDS connection has been established.', { level: 'POSTGRES' });
			await this.loadModels(path.join(__dirname, '..', 'models'));
		} catch (err) {
			Logger.error('Unable to connect to the Amazon RDS.', { level: 'POSTGRES' });
			Logger.info('Attempting to reconnect again in 10 seconds.', { level: 'POSTGRES' });
			setTimeout(this.authenticate.bind(this), 10000);
		}
	}

	static async loadModels(modelsPath) {
		const files = await readdir(modelsPath);
		for (const file of files) {
			const filePath = path.join(modelsPath, file);
			if (!filePath.endsWith('.js')) continue;
			await require(filePath).sync({ alter: true });
		}
	}
}

module.exports = Database;
