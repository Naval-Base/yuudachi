import { join } from 'path';
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, Flag } from 'discord-akairo';
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
import { Counter, register } from 'prom-client';
import { createServer, Server } from 'http';
import { parse } from 'url';
import { init } from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import { Node, NodeMessage } from 'veza';
import { VERSION } from '../util/version';

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		db: Connection;
		node: Node;
		nodeMessage: (m: NodeMessage) => void;
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

		promServer: Server;
	}
}

interface YukikazeOptions {
	owner?: string;
	token?: string;
}

export default class YukikazeClient extends AkairoClient {
	public logger = createLogger({
		format: format.combine(
			format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
			format.printf((info: any): string => {
				const { timestamp, level, message, ...rest } = info;
				return `[${timestamp}] ${level}: ${message}${Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''}`;
			})
		),
		transports: [
			new transports.Console({
				format: format.colorize({ level: true }),
				level: 'info'
			}),
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

	public node!: Node;

	public nodeMessage = (m: NodeMessage) => {
		let res;
		/* eslint-disable no-case-declarations */
		switch (m.data.type) {
			case 'GUILD':
				const guild = this.guilds.get(m.data.id);
				if (guild) res = guild.toJSON();
				break;
			case 'CHANNEL':
				const channel = this.channels.get(m.data.id);
				if (channel) res = channel.toJSON();
				break;
			case 'ROLE':
				const role = this.guilds.get(m.data.guildId)!.roles.get(m.data.id);
				if (role) res = role.toJSON();
				break;
			case 'USER':
				const user = this.users.get(m.data.id);
				if (user) res = user.toJSON();
				break;
			default:
				break;
		}
		/* eslint-enable no-case-declarations */
		if (res) return m.reply({ success: true, d: res });
		return m.reply({ success: false });
	};

	public settings!: TypeORMProvider;

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: (message: Message): string => this.settings.get(message.guild!, 'prefix', process.env.COMMAND_PREFIX!),
		aliasReplacement: /-/g,
		allowMention: true,
		handleEdits: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		defaultCooldown: 3000,
		argumentDefaults: {
			prompt: {
				modifyStart: (_, str): string => `${str}\n\nType \`cancel\` to cancel the command.`,
				modifyRetry: (_, str): string => `${str}\n\nType \`cancel\` to cancel the command.`,
				timeout: 'Guess you took too long, the command has been cancelled.',
				ended: "More than 3 tries and you still didn't quite get it. The command has been cancelled",
				cancel: 'The command has been cancelled.',
				retries: 3,
				time: 30000
			},
			otherwise: ''
		}
	});

	public inhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });

	public listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });

	public config: YukikazeOptions;

	public cachedCases = new Set<string>();

	public muteScheduler!: MuteScheduler;

	public remindScheduler!: RemindScheduler;

	public prometheus = {
		messagesCounter: new Counter({ name: 'yukikaze_messages_total', help: 'Total number of messages Yukikaze has seen' }),
		commandCounter: new Counter({ name: 'yukikaze_commands_total', help: 'Total number of commands used' }),
		lewdcarioAvatarCounter: new Counter({ name: 'yukikaze_lewdcario_avatar_total', help: 'Total number of avatar changes from Lewdcario' }),
		register
	};

	public promServer = createServer((req, res): void => {
		if (parse(req.url!).pathname === '/metrics') {
			res.writeHead(200, { 'Content-Type': this.prometheus.register.contentType });
			res.write(this.prometheus.register.metrics());
		}
		res.end();
	});

	public constructor(config: YukikazeOptions) {
		super({ ownerID: config.owner }, {
			messageCacheMaxSize: 1000,
			disableEveryone: true,
			disabledEvents: ['TYPING_START']
		});

		this.on('message', (): void => {
			this.prometheus.messagesCounter.inc();
		});

		this.commandHandler.resolver.addType('tag', async (message, phrase): Promise<any> => {
			if (!phrase) return Flag.fail(phrase);
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tagsRepo = this.db.getRepository(Tag);
			// TODO: remove this hack once I figure out how to OR operator this
			const tags = await tagsRepo.find();
			const [tag] = tags.filter((t): boolean => t.name === phrase || t.aliases.includes(phrase));
			/* const tag = await this.db.models.tags.findOne({
				where: {
					[Op.or]: [
						{ name: phrase },
						{ aliases: { [Op.contains]: [phrase] } }
					],
					guild: message.guild.id
				}
			}); */

			return tag || Flag.fail(phrase);
		});
		this.commandHandler.resolver.addType('existingTag', async (message, phrase): Promise<any> => {
			if (!phrase) return Flag.fail(phrase);
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tagsRepo = this.db.getRepository(Tag);
			// TODO: remove this hack once I figure out how to OR operator this
			const tags = await tagsRepo.find();
			const [tag] = tags.filter((t): boolean => t.name === phrase || t.aliases.includes(phrase));
			/* const tag = await this.db.models.tags.findOne({
				where: {
					[Op.or]: [
						{ name: phrase },
						{ aliases: { [Op.contains]: [phrase] } }
					],
					guild: message.guild.id
				}
			}); */

			return tag ? Flag.fail(phrase) : phrase;
		});
		this.commandHandler.resolver.addType('tagContent', async (message, phrase): Promise<any> => {
			if (!phrase) phrase = '';
			phrase = Util.cleanContent(phrase, message);
			if (message.attachments.first()) phrase += `\n${message.attachments.first()!.url}`;

			return phrase || Flag.fail(phrase);
		});

		this.config = config;

		if (process.env.SENTRY) {
			init({
				dsn: process.env.SENTRY,
				environment: process.env.NODE_ENV,
				release: VERSION,
				serverName: 'yukikaze_bot',
				integrations: [
					new RewriteFrames({
						root: __dirname || process.cwd()
					})
				]
			});
		} else {
			process.on('unhandledRejection', (err: any): Logger => this.logger.error(`[UNHANDLED REJECTION] ${err.message}`, err.stack));
		}

		if (process.env.LOGS) {
			this.webhooks = new Collection();
		}
	}

	private async _init(): Promise<void> {
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
		this.node = await new Node('bot')
			.on('error', (error, client) => this.logger.error(`[IPC] Error from ${client.name}`, error))
			.on('client.ready', client => this.logger.info(`[IPC] Client connected: ${client.name}`))
			.on('client.destroy', client => this.logger.info(`[IPC] Client destroyed: ${client.name}`))
			.serve(9512);
		this.settings = new TypeORMProvider(this.db.getRepository(Setting));
		await this.settings.init();
		this.muteScheduler = new MuteScheduler(this, this.db.getRepository(Case));
		this.remindScheduler = new RemindScheduler(this, this.db.getRepository(Reminder));
		await this.muteScheduler.init();
		await this.remindScheduler.init();
	}

	public async start(): Promise<string> {
		await this._init();
		return this.login(this.config.token);
	}
}
