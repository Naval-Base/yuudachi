export interface HttpError {
	statusCode: number;
	error: string;
	message: string;
}

export default class HttpException extends Error {
	public status: number;
	public body: HttpError;

	public constructor(body: HttpError) {
		super(`${body.statusCode} ${body.error}: ${body.message}`);

		this.status = body.statusCode;
		this.body = body;
	}
}
