import { join } from 'path';
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Collection, Message, Util, Webhook } from 'discord.js';
import { Logger, createLogger, transports, format } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import database from '../structures/Database';
import TypeORMProvider from '../structures/SettingsProvider';
import MuteScheduler from '../structures/MuteScheduler';
import RemindScheduler from '../structures/RemindScheduler';
import { Setting } from '../models/Settings';
import { Connection } from 'typeorm';
import { Case } from '../models/Cases';
import { Reminder } from '../models/Reminders';
import { Tag } from '../models/Tags';
import { Counter, collectDefaultMetrics, register } from 'prom-client';
import { createServer } from 'http';
import { parse } from 'url';
const Raven = require('raven'); // tslint:disable-line

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		db: Connection;
		settings: TypeORMProvider;
		commandHandler: CommandHandler;
		config: YukikazeOptions;
		webhooks: Collection<string, Webhook>;
		cachedCases: Set<string>;
		muteScheduler: MuteScheduler;
		remindScheduler: RemindScheduler;
		prometheus: {
			commandCounter: Counter;
			lewdcarioAvatarCounter: Counter;
		};
	}
}

interface YukikazeOptions {
	owner?: string;
	token?: string;
}

export default class YukikazeClient extends AkairoClient {
	public logger = createLogger({
		format: format.combine(
			format.colorize({ level: true }),
			format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
			format.printf((info: any) => {
				const { timestamp, level, message, ...rest } = info;
				return `[${timestamp}] ${level}: ${message}${Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''}`;
			})
		),
		transports: [
			new transports.Console({ level: 'info' }),
			new DailyRotateFile({
				format: format.combine(
					format.timestamp(),
					format.json()
				),
				level: 'debug',
				filename: 'yukikaze-%DATE%.log',
				maxFiles: '14d'
			})
		]
	});

	public db!: Connection;

	public settings!: TypeORMProvider;

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: (message: Message) => this.settings.get(message.guild, 'prefix', process.env.COMMAND_PREFIX),
		aliasReplacement: /-/g,
		allowMention: true,
		handleEdits: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		defaultCooldown: 3000,
		defaultPrompt: {
			modifyStart: str => `${str}\n\nType \`cancel\` to cancel the command.`,
			modifyRetry: str => `${str}\n\nType \`cancel\` to cancel the command.`,
			timeout: 'Guess you took too long, the command has been cancelled.',
			ended: "More than 3 tries and you still didn't quite get it. The command has been cancelled",
			cancel: 'The command has been cancelled.',
			retries: 3,
			time: 30000
		}
	});

	public inhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });

	public listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });

	public config: YukikazeOptions;

	public cachedCases = new Set();

	public muteScheduler!: MuteScheduler;

	public remindScheduler!: RemindScheduler;

	public prometheus = {
		messagesCounter: new Counter({ name: 'yukikaze_messages_total', help: 'Total number of messages Yukikaze has seen' }),
		commandCounter: new Counter({ name: 'yukikaze_commands_total', help: 'Total number of commands used' }),
		lewdcarioAvatarCounter: new Counter({ name: 'yukikaze_lewdcario_avatar_total', help: 'Total number of avatar changes from Lewdcario' }),
		collectDefaultMetrics,
		register
	};

	public constructor(config: YukikazeOptions) {
		super({ ownerID: config.owner }, {
			messageCacheMaxSize: 1000,
			disableEveryone: true,
			disabledEvents: ['TYPING_START']
		});

		this.on('message', message => {
			this.prometheus.messagesCounter.inc();
		});

		this.commandHandler.resolver.addType('tag', async (phrase, message) => {
			if (!phrase) return null;
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tagsRepo = this.db.getRepository(Tag);
			// TODO: remove this hack once I figure out how to OR operator this
			const tags = await tagsRepo.find();
			const [tag] = tags.filter(t => t.name === phrase || t.aliases.includes(phrase));
			/* const tag = await this.db.models.tags.findOne({
				where: {
					[Op.or]: [
						{ name: phrase },
						{ aliases: { [Op.contains]: [phrase] } }
					],
					guild: message.guild.id
				}
			}); */

			return tag || null;
		});
		this.commandHandler.resolver.addType('existingTag', async (phrase, message) => {
			if (!phrase) return null;
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tagsRepo = this.db.getRepository(Tag);
			// TODO: remove this hack once I figure out how to OR operator this
			const tags = await tagsRepo.find();
			const [tag] = tags.filter(t => t.name === phrase || t.aliases.includes(phrase));
			/* const tag = await this.db.models.tags.findOne({
				where: {
					[Op.or]: [
						{ name: phrase },
						{ aliases: { [Op.contains]: [phrase] } }
					],
					guild: message.guild.id
				}
			}); */

			return tag ? null : phrase;
		});
		this.commandHandler.resolver.addType('tagContent', (phrase, message) => {
			if (!phrase) phrase = '';
			phrase = Util.cleanContent(phrase, message);
			if (message.attachments.first()) phrase += `\n${message.attachments.first()!.url}`;

			return phrase || null;
		});

		this.config = config;

		if (process.env.RAVEN) {
			Raven.config(process.env.RAVEN, {
				captureUnhandledRejections: true,
				autoBreadcrumbs: true,
				environment: process.env.NODE_ENV,
				release: '0.1.0'
			}).install();
		} else {
			process.on('unhandledRejection', err => this.logger.error(`[UNHANDLED REJECTION] ${err.message}`, err.stack));
		}

		if (process.env.LOGS) {
			this.webhooks = new Collection();
		}

		this.prometheus.collectDefaultMetrics({ prefix: 'yukikaze_', timeout: 30000 });
	}

	private async _init() {
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

		this.db = database.get('yukikaze');
		await this.db.connect();
		this.settings = new TypeORMProvider(this.db.getRepository(Setting));
		await this.settings.init();
		this.muteScheduler = new MuteScheduler(this, this.db.getRepository(Case));
		this.remindScheduler = new RemindScheduler(this, this.db.getRepository(Reminder));
		await this.muteScheduler.init();
		await this.remindScheduler.init();
	}

	public metrics() {
		createServer((req, res) => {
			if (parse(req.url!).pathname === '/metrics') {
				res.writeHead(200, { 'Content-Type': this.prometheus.register.contentType });
				res.write(this.prometheus.register.metrics());
			}
			res.end();
		}).listen(5500);
	}

	public async start() {
		await this._init();
		return this.login(this.config.token);
	}
}
