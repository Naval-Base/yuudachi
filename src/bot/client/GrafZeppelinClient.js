const { join } = require('path');
const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const { createLogger, transports, format } = require('winston');
const database = require('../structures/Database');
const SettingsProvider = require('../structures/SettingsProvider');
const { Op } = require('sequelize');
const { cleanContent } = require('../../util/cleanContent');

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
			defaultCooldown: 3000,
			defaultPrompt: {
				modifyStart: str => `${str}\n\nType \`cancel\` to cancel the command.`,
				modifyRetry: str => `${str}\n\nType \`cancel\` to cancel the command.`,
				timeout: 'Guess you took too long, command as been cancelled.',
				ended: "More than 3 tries and you still didn't quite get it. Command has been cancelled",
				cancel: 'Command has been cancelled.',
				retries: 3,
				time: 30000
			}
		});
		this.commandHandler.resolver.addType('tag', async (phrase, message) => {
			if (!phrase) return null;
			phrase = cleanContent(message, phrase.toLowerCase());
			const tag = await this.db.models.tags.findOne({
				where: {
					[Op.or]: [
						{ name: phrase },
						{ aliases: { [Op.contains]: [phrase] } }
					],
					guild: message.guild.id
				}
			});

			return tag ? tag : null;
		});
		this.commandHandler.resolver.addType('existingTag', async (phrase, message) => {
			if (!phrase) return null;
			phrase = cleanContent(message, phrase.toLowerCase());
			const tag = await this.db.models.tags.findOne({
				where: {
					[Op.or]: [
						{ name: phrase },
						{ aliases: { [Op.contains]: [phrase] } }
					],
					guild: message.guild.id
				}
			});

			return tag ? null : phrase;
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
