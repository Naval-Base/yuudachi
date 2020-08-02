import { Amqp } from '@spectacles/brokers';
import { AmqpResponseOptions } from '@spectacles/brokers/typings/src/Amqp';
import { on } from 'events';
import { Message } from '@spectacles/types';
import postgres from 'postgres';
import { Lexer, Parser, extractCommand, outputToJSON, prefixedStrategy } from 'lexure';

const broker = new Amqp('gateway');
const sql = postgres();

void (async () => {
	await broker.connect('rabbitmq');
	await broker.createQueue('COMMAND');
	await broker.subscribe(['MESSAGE_CREATE']);

	for await (const [message, { ack }] of on(broker, 'MESSAGE_CREATE') as AsyncIterableIterator<
		[Message, AmqpResponseOptions]
	>) {
		ack();
		const [data] = (await sql`select prefix
			from guild_settings
			where guild_id = ${message.guild_id ?? null};`) as [{ prefix: string | null }];
		const prefix = data?.prefix ?? '?';
		const lexer = new Lexer(message.content).setQuotes([
			['"', '"'],
			['“', '”'],
		]);
		const tokens = lexer.lex();
		const command = extractCommand((s) => (s.startsWith(prefix) ? prefix.length : null), tokens);
		if (!command) continue;
		const parser = new Parser(tokens).setUnorderedStrategy(prefixedStrategy(['--', '-'], ['=', ':']));
		const res = parser.parse();
		broker.publish('COMMAND', {
			command,
			arguments: outputToJSON(res),
			tokens,
			message,
		});
	}
})();
