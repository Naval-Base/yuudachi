import type { Redis } from 'ioredis';
import WebSocket from 'ws';
import { logger } from '../logger';

interface ScamAPIData {
	type: 'add' | 'delete';
	domains: string[];
}

export class WebSocketConnection {
	private connection: WebSocket;
	private readonly url: string;
	private readonly redis: Redis;
	private readonly headers: { [key: string]: string } | undefined;
	public constructor(url: string, headers: { [key: string]: string } | undefined, redis: Redis) {
		this.url = url;
		this.redis = redis;
		this.headers = headers;
		this.connection = new WebSocket(url, {
			headers,
		});
		this.connect();
	}

	public connect() {
		this.connection.on('open', this.onOpen.bind(this));
		this.connection.on('message', this.onMessage.bind(this));
		this.connection.on('close', this.onClose.bind(this));
	}

	private onOpen() {
		logger.info(`Websoket connected to at ${this.url}`);
	}

	private onMessage(data: Buffer) {
		const objData = JSON.parse(data.toString()) as ScamAPIData;
		logger.debug({
			loc: 'onMessage',
			data,
			objData,
		});

		if (objData.type === 'add') {
			void this.redis
				.multi()
				.sadd('scamdomains', ...objData.domains)
				.set('scamdomains:refresh', Date.now())
				.exec();
			logger.debug(`domains added: ${objData.domains.join(', ')}`);
		}

		if (objData.type === 'delete') {
			void this.redis
				.multi()
				.srem('scamdomains', ...objData.domains)
				.set('scamdomains:refresh', Date.now())
				.exec();
			logger.debug(`domains removed: ${objData.domains.join(', ')}`);
		}
	}

	private onClose(code: number, reason: string) {
		logger.debug({
			loc: 'onClose',
			code,
			reason,
		});

		this.connection = new WebSocket(this.url, {
			headers: this.headers,
		});
		this.connect();
	}
}
