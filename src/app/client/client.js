const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const path = require('path');
const SettingsProvider = require('../struct/SettingsProvider');
const Database = require('../struct/Database');
const settings = require('../models/settings');
const MuteScheduler = require('../struct/MuteScheduler');
const { Util, Collection } = require('discord.js');
const Tags = require('../models/tags');
const { Op } = require('sequelize');

class Client extends AkairoClient {
	constructor(config) {
		super({ ownerID: config.owner }, {
			disableEveryone: true,
			disabledEvents: ['TYPING_START']
		});

		this.commandHandler = new CommandHandler(this, {
			directory: path.join(__dirname, '..', 'commands'),
			prefix: message => this.settings.get(message.guild, 'prefix', '?'),
			aliasReplacement: /-/g,
			allowMention: true,
			fetchMembers: true,
			commandUtil: true,
			commandUtilLifetime: 3e5,
			commandUtilSweepInterval: 9e5,
			handleEdits: true,
			defaultCooldown: 3000,
			argumentDefaults: {
				prompt: {
					modifyStart: (message, phrase) => [
						`${message.author}, ${phrase}`,
						'type `cancel` to cancel the command.'
					],
					modifyRetry: (message, phrase) => [
						`${message.author}, ${phrase}`,
						'type `cancel` to cancel the command.'
					],
					timeout: message => `${message.author}, time ran out, command has been cancelled.`,
					ended: message => `${message.author}, too many retries, command has been cancelled.`,
					cancel: message => `${message.author}, command has been cancelled.`,
					retries: 3,
					time: 30000
				}
			}
		});

		this.inhibitorHandler = new InhibitorHandler(this, { directory: path.join(__dirname, '..', 'inhibitors') });
		this.listenerHandler = new ListenerHandler(this, { directory: path.join(__dirname, '..', 'listeners') });

		this.settings = new SettingsProvider(settings);
		this.muteScheduler = new MuteScheduler(this);
		this.cached = new Set();
		this.webhooks = new Collection();

		this.commandHandler.resolver.addType('findTag', async (message, phrase) => {
			if (!phrase) return null;
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tag = await Tags.findOne({
				where: {
					name: phrase, guild: message.guild.id
				}
			});

			return tag || null;
		});

		this.commandHandler.resolver.addType('existingTag', async (message, phrase) => {
			if (!phrase) return null;
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tag = await Tags.findOne({
				where: {
					guild: message.guild.id,
					[Op.or]: [
						{ name: phrase },
						{ aliases: { [Op.contains]: [phrase] } }
					]
				}
			});

			return tag ? null : phrase;
		});

		this.commandHandler.resolver.addType('tagContent', (message, phrase) => {
			if (!phrase) phrase = '';
			phrase = Util.cleanContent(phrase, message);
			if (message.attachments.first()) phrase += `\n${message.attachments.first().url}`;

			return phrase || null;
		});

		this.setup();
	}

	setup() {
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

	async start(token) {
		await Database.authenticate();
		await this.settings.init();
		return this.login(token);
	}
}

module.exports = Client;
