import YukikazeClient from '../client/YukikazeClient';

export default class Queue {
	private readonly _queue: ((...args: any) => Promise<any>)[] = [];
	private _processing = false;

	// eslint-disable-next-line no-useless-constructor
	public constructor(public readonly client: YukikazeClient) {}

	public get length() {
		return this._queue.length;
	}

	public async add(promiseFunc: (...args: any) => Promise<any>) {
		this._queue.push(promiseFunc);
		if (!this._processing) await this._process();
	}

	private async _process() {
		this._processing = true;
		const promiseFunc = this._queue.shift();

		if (promiseFunc) {
			try {
				await promiseFunc();
			} catch (error) {
				this.client.logger.error(error);
			} finally {
				await this._process();
			}
		} else {
			this._processing = false;
		}
	}
}
