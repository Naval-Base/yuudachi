import { RewriteFrames } from '@sentry/integrations';
import { init } from '@sentry/node';
import { AkairoClient, CommandHandler, Flag, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Collection, Message, Util, Webhook } from 'discord.js';
import { createServer, Server } from 'http';
import { join } from 'path';
import { Counter, register, Registry } from 'prom-client';
import { Connection, Raw } from 'typeorm';
import { parse } from 'url';
import { NodeMessage, Server as IPCServer } from 'veza';
import { Logger } from 'winston';
import { Case } from '../models/Cases';
import { Reminder } from '../models/Reminders';
import { Setting } from '../models/Settings';
import { Tag } from '../models/Tags';
import CaseHandler from '../structures/case/CaseHandler';
import database from '../structures/Database';
import MuteScheduler from '../structures/MuteScheduler';
import RemindScheduler from '../structures/RemindScheduler';
import TypeORMProvider from '../structures/SettingsProvider';
import { MESSAGES, PROMETHEUS } from '../util/constants';
import { EVENTS, logger, TOPICS } from '../util/logger';

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		db: Connection;
		node: IPCServer;
		nodeMessage: (m: NodeMessage) => void;
		settings: TypeORMProvider;
		commandHandler: CommandHandler;
		config: YukikazeOptions;
		webhooks: Collection<string, Webhook>;
		caseHandler: CaseHandler;
		muteScheduler: MuteScheduler;
		remindScheduler: RemindScheduler;
		prometheus: {
			messagesCounter: Counter;
			commandCounter: Counter;
			lewdcarioAvatarCounter: Counter;
			register: Registry;
		};

		promServer: Server;
	}
}

interface YukikazeOptions {
	owner?: string;
	token?: string;
	root: string;
}

export default class YukikazeClient extends AkairoClient {
	public root: string;

	public logger = logger;

	public db!: Connection;

	public node!: IPCServer;

	public nodeMessage = (m: NodeMessage) => {
		let res;
		/* eslint-disable no-case-declarations */
		switch (m.data.type) {
			case 'GUILD':
				const guild = this.guilds.get(m.data.id);
				if (guild) res = guild.toJSON();
				break;
			case 'GUILD_MEMBER':
				const member = this.guilds.get(m.data.guildId)!.members.get(m.data.id);
				if (member) res = member.toJSON();
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
				modifyStart: (_, str) => MESSAGES.COMMAND_HANDLER.PROMPT.MODIFY_START(str),
				modifyRetry: (_, str) => MESSAGES.COMMAND_HANDLER.PROMPT.MODIFY_RETRY(str),
				timeout: MESSAGES.COMMAND_HANDLER.PROMPT.TIMEOUT,
				ended: MESSAGES.COMMAND_HANDLER.PROMPT.ENDED,
				cancel: MESSAGES.COMMAND_HANDLER.PROMPT.CANCEL,
				retries: 3,
				time: 30000,
			},
			otherwise: '',
		},
	});

	public inhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });

	public listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });

	public config: YukikazeOptions;

	public caseHandler!: CaseHandler;

	public muteScheduler!: MuteScheduler;

	public remindScheduler!: RemindScheduler;

	public prometheus = {
		messagesCounter: new Counter({ name: PROMETHEUS.MESSAGE_COUNTER, help: PROMETHEUS.HELP.MESSAGE_COUNTER }),
		commandCounter: new Counter({ name: PROMETHEUS.COMMAND_COUNTER, help: PROMETHEUS.HELP.COMMAND_COUNTER }),
		lewdcarioAvatarCounter: new Counter({
			name: PROMETHEUS.LEWDCARIO_AVATAR_COUNTER,
			help: PROMETHEUS.HELP.LEWDCARIO_AVATAR_COUNTER,
		}),
		register,
	};

	public promServer = createServer((req, res) => {
		if (parse(req.url!).pathname === '/metrics') {
			res.writeHead(200, { 'Content-Type': this.prometheus.register.contentType });
			res.write(this.prometheus.register.metrics());
		}
		res.end();
	});

	public constructor(config: YukikazeOptions) {
		super(
			{ ownerID: config.owner },
			{
				messageCacheMaxSize: 1000,
				disableEveryone: true,
				disabledEvents: ['TYPING_START'],
			},
		);

		this.root = config.root;

		this.on('message', () => {
			this.prometheus.messagesCounter.inc();
		});

		this.commandHandler.resolver.addType('tag', async (message, phrase) => {
			if (!phrase) return Flag.fail(phrase);
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tagsRepo = this.db.getRepository(Tag);
			let tag;
			try {
				tag = await tagsRepo.findOne({
					where: [
						{ name: phrase, guild: message.guild!.id },
						{ aliases: Raw((alias?: string) => `${alias} @> ARRAY['${phrase}']`), guild: message.guild!.id },
					],
				});
			} catch {}

			return tag || Flag.fail(phrase);
		});
		this.commandHandler.resolver.addType('existingTag', async (message, phrase) => {
			if (!phrase) return Flag.fail(phrase);
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tagsRepo = this.db.getRepository(Tag);
			let tag;
			try {
				tag = await tagsRepo.findOne({
					where: [
						{ name: phrase, guild: message.guild!.id },
						{ aliases: Raw((alias?: string) => `${alias} @> ARRAY['${phrase}']`), guild: message.guild!.id },
					],
				});
			} catch {}

			return tag ? Flag.fail(phrase) : phrase;
		});
		this.commandHandler.resolver.addType('tagContent', async (message, phrase) => {
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
				release: process.env.VERSION!,
				serverName: 'yukikaze_bot',
				integrations: [
					new RewriteFrames({
						root: this.root,
					}),
				],
			});
		} else {
			process.on('unhandledRejection', (err: any) => this.logger.error(err, { topic: TOPICS.UNHANDLED_REJECTION }));
		}

		if (process.env.LOGS) {
			this.webhooks = new Collection();
		}
	}

	private async _init() {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
		});

		this.commandHandler.loadAll();
		this.logger.info(MESSAGES.COMMAND_HANDLER.LOADED, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });
		this.inhibitorHandler.loadAll();
		this.logger.info(MESSAGES.INHIBITOR_HANDLER.LOADED, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });
		this.listenerHandler.loadAll();
		this.logger.info(MESSAGES.LISTENER_HANDLER.LOADED, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });

		this.db = database.get('yukikaze');
		await this.db.connect();
		this.logger.info(MESSAGES.DATABASE.LOADED(this.db.name), { topic: TOPICS.POSTGRES, event: EVENTS.INIT });
		this.node = await new IPCServer('bot')
			.on('error', (error, client) =>
				this.logger.error(MESSAGES.IPC.ERROR(client!.name!, error), { topic: TOPICS.RPC, event: EVENTS.ERROR }),
			)
			.on('open', () => this.logger.info(MESSAGES.IPC.OPEN, { topic: TOPICS.RPC, event: EVENTS.READY }))
			.on('close', () => this.logger.info(MESSAGES.IPC.CLOSE, { topic: TOPICS.RPC, event: EVENTS.DESTROY }))
			.on('connect', client =>
				this.logger.info(MESSAGES.IPC.CONNECT(client.name!), { topic: TOPICS.RPC, event: EVENTS.CONNECT }),
			)
			.on('disconnect', client =>
				this.logger.info(MESSAGES.IPC.DISCONNECT(client.name!), { topic: TOPICS.RPC, event: EVENTS.DISCONNECT }),
			)
			.listen(9512);
		this.settings = new TypeORMProvider(this.db.getRepository(Setting));
		await this.settings.init();
		this.logger.info(MESSAGES.SETTINGS.INIT, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });
		this.caseHandler = new CaseHandler(this, this.db.getRepository(Case));
		this.logger.info(MESSAGES.CASE_HANDLER.INIT, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });
		this.muteScheduler = new MuteScheduler(this, this.db.getRepository(Case));
		this.remindScheduler = new RemindScheduler(this, this.db.getRepository(Reminder));
		await this.muteScheduler.init();
		this.logger.info(MESSAGES.MUTE_SCHEDULER.INIT, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });
		await this.remindScheduler.init();
		this.logger.info(MESSAGES.REMIND_SCHEDULER.INIT, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });
	}

	public async start() {
		await this._init();
		return this.login(this.config.token);
	}
}
