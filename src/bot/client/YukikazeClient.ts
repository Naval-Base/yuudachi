import { RewriteFrames } from '@sentry/integrations';
import { init } from '@sentry/node';
import { AkairoClient, CommandHandler, Flag, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Collection, Message, Util, Webhook } from 'discord.js';
import { createServer, Server } from 'http';
import { join } from 'path';
import { Counter, register, Registry } from 'prom-client';
import { parse } from 'url';
import { Logger } from 'winston';
import CaseHandler from '../structures/CaseHandler';
import LockdownScheduler from '../structures/LockdownScheduler';
import MuteScheduler from '../structures/MuteScheduler';
import Queue from '../structures/Queue';
import HasuraProvider from '../structures/SettingsProvider';
import { MESSAGES, PRODUCTION, PROMETHEUS, SETTINGS } from '../util/constants';
import { GRAPHQL, graphQLClient } from '../util/graphQL';
import { Tags, TagsInsertInput } from '../util/graphQLTypes';
import { EVENTS, logger, TOPICS } from '../util/logger';

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		settings: HasuraProvider;
		commandHandler: CommandHandler;
		config: YukikazeOptions;
		webhooks: Collection<string, Webhook>;
		caseHandler: CaseHandler;
		muteScheduler: MuteScheduler;
		lockdownScheduler: LockdownScheduler;
		prometheus: {
			messagesCounter: Counter;
			commandCounter: Counter;
			lewdcarioAvatarCounter: Counter;
			register: Registry;
		};

		promServer: Server;
	}
}

declare module 'discord.js' {
	interface Guild {
		caseQueue: Queue;
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

	public settings = new HasuraProvider();

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: (message: Message): string =>
			this.settings.get(message.guild!, SETTINGS.PREFIX, process.env.COMMAND_PREFIX),
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

	public caseHandler = new CaseHandler(this);

	public muteScheduler = new MuteScheduler(this);

	public lockdownScheduler = new LockdownScheduler(this);

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
		if (parse(req.url ?? '').pathname === '/metrics') {
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
			if (!message.guild) return Flag.fail(phrase);
			if (!phrase) return Flag.fail(phrase);
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const { data } = await graphQLClient.query<any, TagsInsertInput>({
				query: GRAPHQL.QUERY.TAGS_TYPE,
				variables: {
					guild: message.guild.id,
				},
			});
			let tags: Tags[];
			if (PRODUCTION) tags = data.tags;
			else tags = data.tagsStaging;
			const [tag] = tags.filter(t => t.name === phrase || t.aliases.includes(phrase));

			return tag || Flag.fail(phrase);
		});
		this.commandHandler.resolver.addType('existingTag', async (message, phrase) => {
			if (!message.guild) return Flag.fail(phrase);
			if (!phrase) return Flag.fail(phrase);
			const phraseArr = phrase.split(',');
			phraseArr.forEach(s => Util.cleanContent(s.trim().toLowerCase(), message));
			const { data } = await graphQLClient.query<any, TagsInsertInput>({
				query: GRAPHQL.QUERY.TAGS_TYPE,
				variables: {
					guild: message.guild.id,
				},
			});
			let tags: Tags[];
			if (PRODUCTION) tags = data.tags;
			else tags = data.tagsStaging;
			const [tag] = tags.filter(t => phraseArr.some(p => p === t.name || t.aliases.includes(p)));

			return tag ? Flag.fail(tag.name) : phrase;
		});

		this.config = config;

		if (process.env.SENTRY) {
			init({
				dsn: process.env.SENTRY,
				environment: process.env.NODE_ENV,
				release: process.env.VERSION,
				serverName: 'yukikaze_bot',
				integrations: integrations => {
					integrations
						.filter(integration => integration.name !== 'Breadcrumbs')
						.push(
							new RewriteFrames({
								root: this.root,
							}),
						);
					return integrations;
				},
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
		await this.settings.init();
		this.logger.info(MESSAGES.SETTINGS.INIT, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });
		await this.muteScheduler.init();
		this.logger.info(MESSAGES.MUTE_SCHEDULER.INIT, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });
		await this.lockdownScheduler.init();
		this.logger.info(MESSAGES.LOCKDOWN_SCHEDULER.INIT, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.INIT });
	}

	public async start() {
		await this._init();
		return this.login(this.config.token);
	}
}
