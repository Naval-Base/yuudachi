import 'reflect-metadata';
import YukikazeClient from './bot/client/YukikazeClient';

const client = new YukikazeClient({ owner: process.env.OWNERS, token: process.env.TOKEN });

client
	.on('error', err => client.logger.error(`[CLIENT ERROR] ${err.message}`, err.stack))
	.on('warn', warn => client.logger.warn(`[CLIENT WARN] ${warn}`));

client.start();
client.metrics();
