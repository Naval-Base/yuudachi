import 'reflect-metadata';
import YukikazeClient from './client/YukikazeClient';
import { Logger } from 'winston';

const client = new YukikazeClient({ owner: process.env.OWNERS, token: process.env.TOKEN });

client
	// @ts-ignore
	.on('error', (err): Logger => client.logger.error(err, { topic: 'DISCORD', event: 'ERROR' }))
	// @ts-ignore
	.on('shardError', (err, id): Logger => client.logger.error(err, { topic: 'DISCORD', event: `SHARD ${id} ERROR` }))
	.on('warn', (warn): Logger => client.logger.warn(warn, { topic: 'DISCORD', event: 'WARN' }));

client.start();
