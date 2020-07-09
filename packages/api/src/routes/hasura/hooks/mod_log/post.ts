import Joi from '@hapi/joi';
import { Request, Response, NextHandler } from 'polka';
import { injectable } from 'tsyringe';
import { validate, bodyParser } from '../../../../middleware';
import CaseLogManager from '../../../../managers/CaseLogManager';
import Route from '../../../../Route';
import { RawCase } from '../../../../managers/CaseManager';

enum HasuraAction {
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	MANUAL = 'UPDATE',
}

interface HasuraMogLogEventPayload {
	event: {
		session_variables: Record<string, string>;
		op: keyof typeof HasuraAction;
		data: {
			old: Record<string, unknown> | null;
			new: Record<string, unknown> | null;
		};
	};
	delivery_info: Record<string, string>;
	created_at: Date;
	id: string;
	trigger: {
		name: string;
	};
	table: {
		schema: string;
		name: string;
	};
}

@injectable()
export default class HasuraModLogEventHook extends Route {
	public middleware = [
		bodyParser,
		validate(
			Joi.object()
				.keys({
					event: Joi.object()
						.keys({
							session_variables: Joi.object(),
							op: Joi.string().valid('INSERT', 'UPDATE', 'DELETE', 'MANUAL').required(),
							data: Joi.object({
								old: Joi.object().allow(null),
								new: Joi.object().allow(null),
							}).required(),
						})
						.required(),
					delivery_info: Joi.object(),
					created_at: Joi.date().required(),
					id: Joi.string().required(),
					trigger: Joi.object()
						.keys({
							name: Joi.string().required(),
						})
						.required(),
					table: Joi.object()
						.keys({
							schema: Joi.string().required(),
							name: Joi.string().required(),
						})
						.required(),
				})
				.required(),
		),
	];

	public constructor(public caseLogManager: CaseLogManager) {
		super();
	}

	public handle(req: Request, res: Response, next: NextHandler) {
		if (!req.body) {
			return next(new Error('uh oh, something broke'));
		}

		const body: HasuraMogLogEventPayload = req.body as any;
		switch (body.event.op) {
			case 'UPDATE':
			case 'MANUAL':
				// this.caseLogManager.update(body.event.data.new);
				break;
			case 'INSERT':
				if (!body.event.data.new) break;
				void this.caseLogManager.create((body.event.data.new as unknown) as RawCase);
				break;
			case 'DELETE':
				// this.caseLogManager.delete(body.event.data.old);
				break;
		}

		res.statusCode = 200;
		res.end();
	}
}
