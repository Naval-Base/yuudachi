import 'reflect-metadata';
import { readFile } from 'node:fs/promises';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import { GatewayIntentBits, Options, Partials } from 'discord.js';
import i18next from 'i18next';
import { default as Backend } from 'i18next-fs-backend';
import readdirp from 'readdirp';
import { container } from 'tsyringe';
import { Command, commandInfo } from './Command.js';
import type { Event } from './Event.js';
import { scamDomainRequestHeaders } from './functions/anti-scam/refreshScamDomains.js';
import { logger } from './logger.js';
import { createBree } from './util/bree.js';
import { createClient } from './util/client.js';
import { createCommands } from './util/commands.js';
import { createPostgres } from './util/postgres.js';
import { createRedis } from './util/redis.js';
import { createWebhooks } from './util/webhooks.js';
import { WebSocketConnection } from './websocket/WebSocketConnection.js';

createPostgres();
const redis = createRedis();
createBree();

const client = createClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.GuildMember],
	makeCache: Options.cacheWithLimits({
		MessageManager: 100,
		StageInstanceManager: 10,
		VoiceStateManager: 10,
	}),
});

const commands = createCommands();
createWebhooks();

const commandFiles = readdirp(fileURLToPath(new URL('./commands', import.meta.url)), {
	fileFilter: '*.js',
	directoryFilter: '!sub',
});

const eventFiles = readdirp(fileURLToPath(new URL('./events', import.meta.url)), {
	fileFilter: '*.js',
});

try {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const shorteners = JSON.parse(
		(await readFile(fileURLToPath(new URL('../linkshorteners.json', import.meta.url).href))).toString(),
	);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	await redis.sadd('linkshorteners', ...shorteners);
	await i18next.use(Backend).init({
		backend: {
			loadPath: fileURLToPath(new URL('./locales/{{lng}}/{{ns}}.json', import.meta.url)),
		},
		cleanCode: true,
		preload: ['en-US', 'en-GB', 'de'],
		supportedLngs: ['en-US', 'en-GB', 'de'],
		fallbackLng: ['en-US'],
	});

	for await (const dir of commandFiles) {
		const cmdInfo = commandInfo(dir.path);
		if (!cmdInfo) continue;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
		const command = container.resolve<Command>((await import(pathToFileURL(dir.fullPath).href)).default);
		logger.info(
			{ command: { name: command.name ?? cmdInfo.name } },
			`Registering command: ${command.name ?? cmdInfo.name}`,
		);

		commands.set((command.name ?? cmdInfo.name).toLowerCase(), command);
	}

	for await (const dir of eventFiles) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
		const event_ = container.resolve<Event>((await import(pathToFileURL(dir.fullPath).href)).default);
		logger.info({ event: { name: event_.name, event: event_.event } }, `Registering event: ${event_.name}`);

		if (event_.disabled) {
			continue;
		}
		event_.execute();
	}

	await client.login();

	const wsURL = process.env.SCAM_DOMAIN_WS;
	if (wsURL) {
		new WebSocketConnection(process.env.SCAM_DOMAIN_WS!, scamDomainRequestHeaders['SCAM_DOMAIN_URL'], redis);
	} else {
		logger.info(`Missing env var 'SCAM_DOMAIN_WS`);
	}
} catch (e) {
	const error = e as Error;
	logger.error(error, error.message);
}
