const env = require('dotenv');
env.config();
const Client = require('./app/client/client');
const Logger = require('./app/util/logger');
const Sentry = require('@sentry/node');
const { name: environment, version: release } = require('../package.json');

const client = new Client({ owner: process.env.OWNER });

if (process.env.SENTRY) {
	Sentry.init({ dsn: process.env.SENTRY, environment, release });
}

client.on('error', error => Logger.error(error, { level: 'CLIENT ERROR' }));
client.on('warn', warn => Logger.warn(warn, { level: 'CLIENT WARN' }));

client.start(process.env.TOKEN);

process.on('unhandledRejection', error => Logger.error(error, { level: 'UNHANDLED REJECTION' }));
