import type { Buffer } from "node:buffer";
import { setTimeout } from "node:timers";
import type { Redis } from "ioredis";
import WebSocket from "ws";
import { logger } from "../logger.js";

type ScamAPIData = {
	domains: string[];
	type: "add" | "delete";
};

export class WebSocketConnection {
	private connection: WebSocket;

	private readonly url: string;

	private readonly identity: string;

	private readonly redis: Redis;

	private readonly headers: { [key: string]: string } | undefined;

	private tries = 0;

	public constructor(url: string, headers: { [key: string]: string } | undefined, redis: Redis) {
		this.url = url;
		this.identity = process.env.SCAM_DOMAIN_IDENTITY!;
		this.redis = redis;
		this.headers = headers;
		this.connection = new WebSocket(url, {
			headers,
		});
		this.connect();
	}

	public connect() {
		this.connection.on("open", this.onOpen.bind(this));
		this.connection.on("message", this.onMessage.bind(this));
		this.connection.on("close", this.onClose.bind(this));
		this.connection.on("error", this.onError.bind(this));
	}

	private onOpen() {
		logger.info({
			msg: `Websoket connected to ${this.url} as ${this.identity}`,
			url: this.url,
			identity: this.identity,
		});
		this.tries = 0;
	}

	private onError(error: Error) {
		logger.warn(error, "WS error received");
	}

	private onMessage(data: Buffer) {
		const objData = JSON.parse(data.toString()) as ScamAPIData;
		logger.info({
			msg: `Websocket message received: ${data.toString()}`,
			url: this.url,
		});

		if (objData.type === "add") {
			void this.redis
				.multi()
				.sadd("scamdomains", ...objData.domains)
				.set("scamdomains:refresh", Date.now())
				.exec();
			logger.info({
				msg: `WebSocket based update of domains (add): ${objData.domains.join(", ")}`,
				url: this.url,
			});
		}

		if (objData.type === "delete") {
			void this.redis
				.multi()
				.srem("scamdomains", ...objData.domains)
				.set("scamdomains:refresh", Date.now())
				.exec();
			logger.info({
				msg: `WebSocket based update of domains (remove): ${objData.domains.join(", ")}`,
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
		return Math.min(Math.floor(Math.exp(this.tries)), 10 * 60) * 1_000;
	}
}
