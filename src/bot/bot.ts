import 'reflect-metadata';
import YukikazeClient from './client/YukikazeClient';
import { __rootdir__ } from './root';
import YukikazeGuild from './structures/YukikazeGuild';
import { EVENTS, TOPICS } from './util/logger';

YukikazeGuild();
const client = new YukikazeClient({ owner: process.env.OWNERS, token: process.env.TOKEN, root: __rootdir__ });

client
	.on('error', (err) => client.logger.error(err.message, { topic: TOPICS.DISCORD, event: EVENTS.ERROR }))
	.on('shardError', (err, id) =>
		client.logger.error(err.message, { topic: TOPICS.DISCORD, event: `SHARD ${id} ERROR` }),
	)
	.on('warn', (info) => client.logger.warn(info, { topic: TOPICS.DISCORD, event: EVENTS.WARN }));

client.start();
