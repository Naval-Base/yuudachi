const { join } = require('path');
const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const { createLogger, transports, format } = require('winston');
const database = require('../structures/Database');
const SettingsProvider = require('../structures/SettingsProvider');

class GrafZeppelinClient extends AkairoClient {
	constructor(config) {
		super({ ownerID: config.owner }, {
			disableEveryone: true,
			disableEvents: ['TYPING_START']
		});

		this.logger = createLogger({
			format: format.combine(
				format.colorize({ all: true }),
				format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
				format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
			),
			transports: [new transports.Console()]
		});

		this.db = database;

		this.settings = new SettingsProvider(database.model('settings'));

		this.commandHandler = new CommandHandler(this, {
			directory: join(__dirname, '..', 'commands'),
			prefix: process.env.COMMAND_PREFIX,
			aliasReplacement: /-/g,
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 3e5,
			defaultCooldown: 3000
		});

		this.inhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });
		this.listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });

		this.config = config;

		this.init();
	}

	init() {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler
		});

		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();
	}

	async start() {
		await this.settings.init();
		return this.login(this.config.token);
	}
}

module.exports = GrafZeppelinClient;
