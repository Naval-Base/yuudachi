export default class HttpException extends Error {
	public constructor(public readonly status: number, public readonly body: string) {
		super(`${status}: ${body}`);
	}
}
