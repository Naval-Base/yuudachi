import "reflect-metadata";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { URL, fileURLToPath, pathToFileURL } from "node:url";
import {
	type Command,
	logger,
	kCommands,
	kRedis,
	createClient,
	commandInfo,
	createCommands,
	dynamicImport,
	createPostgres,
	createRedis,
	container,
} from "@yuudachi/framework";
import type { Event, CommandPayload } from "@yuudachi/framework/types";
import { GatewayIntentBits, Options, Partials } from "discord.js";
import type { Redis } from "ioredis";
import readdirp from "readdirp";
import { scamDomainRequestHeaders } from "./functions/anti-scam/refreshScamDomains.js";
import { createI18next } from "./util/i18next.js";
import { createWebhooks } from "./util/webhooks.js";
import { WebSocketConnection } from "./websocket/WebSocketConnection.js";

await createPostgres();
await createRedis();

const client = createClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		1 << 21, // AutoModActionExecution
	],
	partials: [Partials.GuildMember],
	makeCache: Options.cacheWithLimits({
		MessageManager: 100,
		StageInstanceManager: 10,
		VoiceStateManager: 10,
	}),
});

createCommands();
createWebhooks();

const commandFiles = readdirp(fileURLToPath(new URL("commands", import.meta.url)), {
	fileFilter: "*.js",
	directoryFilter: "!sub",
});

const eventFiles = readdirp(fileURLToPath(new URL("events", import.meta.url)), {
	fileFilter: "*.js",
});

try {
	const redis = container.resolve<Redis>(kRedis);
	const commands = container.resolve<Map<string, Command<CommandPayload>>>(kCommands);

	const shorteners = JSON.parse(
		(await readFile(fileURLToPath(new URL("../linkshorteners.json", import.meta.url).href))).toString(),
	) as string[];
	await redis.sadd("linkshorteners", ...shorteners);

	await createI18next();

	for await (const dir of commandFiles) {
		const cmdInfo = commandInfo(dir.path);

		if (!cmdInfo) {
			continue;
		}

		const dynamic = dynamicImport<new () => Command<CommandPayload>>(
			async () => import(pathToFileURL(dir.fullPath).href),
		);
		const command = container.resolve<Command<CommandPayload>>((await dynamic()).default);
		logger.info(
			{ command: { name: command.name?.join(", ") ?? cmdInfo.name } },
			`Registering command: ${command.name?.join(", ") ?? cmdInfo.name}`,
		);

		if (command.name) {
			for (const name of command.name) {
				commands.set(name.toLowerCase(), command);
			}
		} else {
			commands.set(cmdInfo.name.toLowerCase(), command);
		}
	}

	for await (const dir of eventFiles) {
		const dynamic = dynamicImport<new () => Event>(async () => import(pathToFileURL(dir.fullPath).href));
		const event_ = container.resolve<Event>((await dynamic()).default);
		logger.info({ event: { name: event_.name, event: event_.event } }, `Registering event: ${event_.name}`);

		if (event_.disabled) {
			continue;
		}

		void event_.execute();
	}

	await client.login();

	const wsURL = process.env.SCAM_DOMAIN_WS;
	const identity = process.env.SCAM_DOMAIN_IDENTITY;

	if (wsURL && identity) {
		new WebSocketConnection(process.env.SCAM_DOMAIN_WS!, scamDomainRequestHeaders.SCAM_DOMAIN_URL, redis);
	} else {
		logger.warn(`Missing env var 'SCAM_DOMAIN_WS or 'SCAM_DOMAIN_IDENTITY' to instantiate a WebSocketConnection`, {
			wsURL,
			identity,
		});
	}
} catch (error_) {
	const error = error_ as Error;
	logger.error(error, error.message);
}
