import 'reflect-metadata';
import YukikazeClient from './client/YukikazeClient';
import { Logger } from 'winston';
import { TOPICS, EVENTS } from './util/logger';

const client = new YukikazeClient({ owner: process.env.OWNERS, token: process.env.TOKEN });

client
	// @ts-ignore
	.on('error', (err): Logger => client.logger.error(err, { topic: TOPICS.DISCORD, event: EVENTS.ERROR }))
	// @ts-ignore
	.on('shardError', (err, id): Logger => client.logger.error(err, { topic: TOPICS.DISCORD, event: `SHARD ${id} ERROR` }))
	.on('warn', (warn): Logger => client.logger.warn(warn, { topic: TOPICS.DISCORD, event: EVENTS.WARN }));

client.start();
