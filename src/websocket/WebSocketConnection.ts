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
	private tries = 0;
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
		logger.info({
			msg: `Websoket connected to ${this.url}`,
			url: this.url,
		});
		this.tries = 0;
	}

	private onMessage(data: Buffer) {
		const objData = JSON.parse(data.toString()) as ScamAPIData;
		logger.info({
			msg: `Websocket message received: ${data.toString()}`,
			url: this.url,
		});

		if (objData.type === 'add') {
			void this.redis
				.multi()
				.sadd('scamdomains', ...objData.domains)
				.set('scamdomains:refresh', Date.now())
				.exec();
			logger.info({
				msg: `WebSocket based update of domains (add): ${objData.domains.join(', ')}`,
				url: this.url,
			});
		}

		if (objData.type === 'delete') {
			void this.redis
				.multi()
				.srem('scamdomains', ...objData.domains)
				.set('scamdomains:refresh', Date.now())
				.exec();
			logger.info({
				msg: `WebSocket based update of domains (remove): ${objData.domains.join(', ')}`,
				url: this.url,
			});
		}
	}

	private onClose(code: number, reason: string) {
		const backOff = this.backOff();
		this.tries += 1;

		logger.info({
			msg: `WebSocket closed with code ${code} and reason ${reason}. Attempting reconnect after ${String(
				backOff,
			)} seconds`,
			url: this.url,
			code,
			reason,
			attemptReconnectAfterSeconds: backOff,
		});

		setTimeout(() => {
			this.connection = new WebSocket(this.url, {
				headers: this.headers,
			});
			this.connect();
		}, this.backOff());
	}

	private backOff() {
		return Math.min(Math.floor(Math.exp(this.tries)), 10 * 60) * 1000;
	}
}
