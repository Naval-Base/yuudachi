import 'reflect-metadata';

import { Amqp } from '@spectacles/brokers';
import { AmqpResponseOptions } from '@spectacles/brokers/typings/src/Amqp';
import { on } from 'events';
import postgres from 'postgres';
import { Lexer, Parser, prefixedStrategy } from 'lexure';
import { resolve } from 'path';
import readdirp from 'readdirp';
import Rest from '@yuudachi/rest';
import { container } from 'tsyringe';
import { Message } from '@spectacles/types';

import Command, { commandInfo } from '../src/Command';
import { kSQL } from '../src/tokens';

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('missing discord token');

const restBroker = new Amqp('rest');
const rest = new Rest(token, restBroker);
const broker = new Amqp('gateway');
const sql = postgres();

container.register(Rest, { useValue: rest });
container.register(kSQL, { useValue: sql });

const commands = new Map<string, Command>();

const files = readdirp(resolve(__dirname, '..', 'src', 'commands'), {
	fileFilter: '*.js',
});

void (async () => {
	const conn = await broker.connect('rabbitmq');
	await broker.subscribe(['MESSAGE_CREATE']);

	await restBroker.connect(conn);

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

		const [data] = (await sql`select prefix
			from guild_settings
			where guild_id = ${message.guild_id ?? null};`) as [{ prefix: string | null }];
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const prefix = data?.prefix ?? '?';
		const lexer = new Lexer(message.content).setQuotes([
			['"', '"'],
			['“', '”'],
		]);
		const res = lexer.lexCommand((s) => (s.startsWith(prefix) ? prefix.length : null));
		if (!res) continue;
		const cmd = res[0];
		const tokens = res[1]();
		const parser = new Parser(tokens).setUnorderedStrategy(prefixedStrategy(['--', '-'], ['=', ':']));
		const out = parser.parse();

		const command = commands.get(cmd.value);
		if (!command) continue;
		command.execute(message, out);
	}
})();
