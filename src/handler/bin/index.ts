import 'reflect-metadata';

import { Amqp } from '@spectacles/brokers';
import { AmqpResponseOptions } from '@spectacles/brokers/typings/src/Amqp';
import { on } from 'events';
import postgres from 'postgres';
import { Lexer, Parser, prefixedStrategy, Args, Token, ParserOutput } from 'lexure';
import { resolve } from 'path';
import readdirp from 'readdirp';
import API from '@yuudachi/api';
import Rest from '@yuudachi/rest';
import { container } from 'tsyringe';
import { Message } from '@spectacles/types';
import i18next from 'i18next';
import HttApi, { BackendOptions } from 'i18next-http-backend';
import { decode, encode } from '@msgpack/msgpack';

import Command, { commandInfo, ExecutionContext } from '../src/Command';
import { kSQL } from '../src/tokens';

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('missing DISCORD_TOKEN');

const apiURL = process.env.API_URL;
if (!apiURL) throw new Error('missing API_URL');

const api = new API(apiURL);
const restBroker = new Amqp('rest', {
	serialize: (data: any) => {
		const encoded = encode(data);
		return Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
	},
	deserialize: (data: Buffer | Uint8Array) => {
		return decode(data);
	},
});
const rest = new Rest(token, restBroker);
const broker = new Amqp('gateway');
const sql = postgres();

container.register(API, { useValue: api });
container.register(Rest, { useValue: rest });
container.register(kSQL, { useValue: sql });

const commands = new Map<string, Command>();

const files = readdirp(resolve(__dirname, '..', 'src', 'commands'), {
	fileFilter: '*.js',
	directoryFilter: '!sub',
});

void (async () => {
	const conn = await broker.connect('rabbitmq');
	await broker.subscribe(['MESSAGE_CREATE']);

	await restBroker.connect(conn);

	await i18next.use(HttApi).init({
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		backend: {
			loadPath: `${apiURL}/locales/{{lng}}/{{ns}}.json`,
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

	for await (const [message, { ack }] of on(broker, 'MESSAGE_CREATE') as AsyncIterableIterator<
		[Message, AmqpResponseOptions]
	>) {
		ack();

		const [data] = await sql<{ prefix: string | null; locale: string }>`select prefix
			from guild_settings
			where guild_id = ${message.guild_id ?? null};`;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const prefix = data?.prefix ?? '?';
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const locale = data?.locale ?? 'en';
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
				try {
					await command.execute(message, new Args(out), locale, ExecutionContext['PREFIXED']);
				} catch (error) {
					void rest.post(`/channels/${message.channel_id}/messages`, { content: error.message });
				}

				continue;
			}
		}

		for (const command of commands.values()) {
			if (!command.regExp) continue;
			const match = command.regExp.exec(message.content);
			if (!match) continue;

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
				void rest.post(`/channels/${message.channel_id}/messages`, { content: error.message });
			}

			break;
		}

		continue;
	}
})();
