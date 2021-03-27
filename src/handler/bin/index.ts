import 'reflect-metadata';

import { Amqp } from '@spectacles/brokers';
import { AmqpResponseOptions } from '@spectacles/brokers/typings/src/Amqp';
import { on } from 'events';
import postgres from 'postgres';
import { Lexer, Parser, prefixedStrategy, Args, Token, ParserOutput } from 'lexure';
import { resolve } from 'path';
import readdirp from 'readdirp';
import API from '@yuudachi/api';
import Rest, { createAmqpBroker } from '@yuudachi/rest';
import { container } from 'tsyringe';
import { APIInteraction, APIMessage, GatewayDispatchEvents } from 'discord-api-types/v8';
import i18next from 'i18next';
import HttApi, { BackendOptions } from 'i18next-http-backend';
import { Tokens, parseInteraction } from '@yuudachi/core';
import { CommandModules } from '@yuudachi/types';

import Command, { commandInfo, ExecutionContext } from '../src/Command';
import { has, send } from '../src/util';

const { kGateway, kSQL } = Tokens;

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('missing DISCORD_TOKEN');

const apiURL = process.env.API_URL;
if (!apiURL) throw new Error('missing API_URL');

const api = new API(apiURL);
const restBroker = createAmqpBroker('rest');
const rest = new Rest(token, restBroker);
const gatewayBroker = new Amqp('gateway');
const sql = postgres();

container.register(API, { useValue: api });
container.register(Rest, { useValue: rest });
container.register(kGateway, { useValue: gatewayBroker });
container.register(kSQL, { useValue: sql });

const commands = new Map<string, Command>();

const files = readdirp(resolve(__dirname, '..', 'src', 'commands'), {
	fileFilter: '*.js',
	directoryFilter: '!sub',
});

const messageCreate = async () => {
	for await (const [message, { ack }] of on(
		gatewayBroker,
		GatewayDispatchEvents.MessageCreate,
	) as AsyncIterableIterator<[APIMessage, AmqpResponseOptions]>) {
		ack();

		const [data] = await sql<
			[
				{
					prefix: string | null;
					locale: string | null;
					modules: number | null;
				}?,
			]
		>`select prefix, locale, modules
			from guild_settings
			where guild_id = ${message.guild_id ?? null}`;

		const prefix = data?.prefix ?? '?';
		const locale = data?.locale ?? 'en';
		const modules = data?.modules ?? CommandModules.Config;
		const lexer = new Lexer(message.content).setQuotes([
			['"', '"'],
			['“', '”'],
			['「', '」'],
		]);
		const res = lexer.lexCommand((s) => (s.startsWith(prefix) ? prefix.length : null));

		if (res) {
			const [cmd, tokens] = res;
			const parser = new Parser(tokens()).setUnorderedStrategy(prefixedStrategy(['--', '-'], ['=', ':']));
			const out = parser.parse();

			const command = commands.get(cmd.value);
			if (command) {
				if (!has(modules, command.category)) {
					continue;
				}
				try {
					await command.execute(message, new Args(out), locale, ExecutionContext['PREFIXED']);
				} catch (error) {
					void send(message, { content: error.message });
				}

				continue;
			}
		}

		for (const command of commands.values()) {
			if (!has(modules, command.category) || !command.regExp) {
				continue;
			}
			const match = command.regExp.exec(message.content);
			if (!match) {
				continue;
			}

			const [, ...args] = match;
			const tokens: Token[] = args.filter((v) => v).map((s) => ({ raw: s, trailing: '', value: s }));
			const out: ParserOutput = {
				ordered: tokens,
				flags: new Set(),
				options: new Map(),
			};

			try {
				await command.execute(message, new Args(out), locale, ExecutionContext['REGEXP']);
			} catch (error) {
				void send(message, { content: error.message });
			}

			break;
		}

		continue;
	}
};

const interactionCreate = async () => {
	for await (const [interaction, { ack }] of on(
		gatewayBroker,
		GatewayDispatchEvents.InteractionCreate,
	) as AsyncIterableIterator<[APIInteraction, AmqpResponseOptions]>) {
		ack();
		console.log(interaction);

		const out = parseInteraction(interaction.data?.options ?? []);
		const [data] = await sql<
			[
				{
					locale: string | null;
					modules: number | null;
				}?,
			]
		>`select locale, modules
			from guild_settings
			where guild_id = ${interaction.guild_id}`;

		const locale = data?.locale ?? 'en';
		const modules = data?.modules ?? CommandModules.Config;

		const command = commands.get(interaction.data?.name ?? '');
		if (command && interaction.data) {
			if (!has(modules, command.category)) {
				void send(interaction, {
					content: i18next.t('command.common.errors.no_enabled_module', { module: command.category, lng: locale }),
					flags: 64,
				});
				continue;
			}
			try {
				await command.execute(interaction, new Args(out), locale, ExecutionContext['INTERACTION']);
			} catch (error) {
				void send(interaction, {
					content: error.message,
					flags: 64,
				});
			}

			continue;
		}

		void send(interaction, {
			content: i18next.t('command.common.errors.generic', { lng: locale }),
			flags: 64,
		});
		continue;
	}
};

void (async () => {
	const conn = await gatewayBroker.connect('rabbitmq');
	await gatewayBroker.subscribe([
		GatewayDispatchEvents.MessageCreate,
		GatewayDispatchEvents.InteractionCreate,
		GatewayDispatchEvents.GuildMembersChunk,
	]);

	await restBroker.connect(conn);

	await i18next.use(HttApi).init({
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		backend: {
			loadPath: `${apiURL}/locales/{{lng}}/{{ns}}.json`,
			reloadInterval: 60000,
		} as BackendOptions,
		cleanCode: true,
		fallbackLng: ['en'],
		defaultNS: 'handler',
		lng: 'en',
		lowerCaseLng: true,
		ns: ['handler'],
	});

	for await (const dir of files) {
		const cmdInfo = commandInfo(dir.path);
		if (!cmdInfo) continue;

		console.log(cmdInfo);
		const command = container.resolve<Command>((await import(dir.fullPath)).default);
		commands.set(command.name ?? cmdInfo.name, command);
		command.aliases?.forEach((alias) => commands.set(alias, command));
	}

	void messageCreate();
	void interactionCreate();
})();
