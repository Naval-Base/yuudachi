import 'reflect-metadata';
import YukikazeClient from './client/YukikazeClient';
import { Logger } from 'winston';

const client = new YukikazeClient({ owner: process.env.OWNERS, token: process.env.TOKEN });

client
	.on('error', (err): Logger => client.logger.error(`[CLIENT ERROR] ${err.message}`, err.stack))
	.on('shardError', (err, id): Logger => client.logger.error(`[SHARD ${id} ERROR] ${err.message}`, err.stack))
	.on('warn', (warn): Logger => client.logger.warn(`[CLIENT WARN] ${warn}`));

client.start();
