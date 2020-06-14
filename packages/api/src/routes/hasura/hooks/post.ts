import * as Joi from '@hapi/joi';
import { Request, Response, NextHandler } from 'polka';
import { injectable } from 'tsyringe';
import validate from '../../../middleware/validate';
import CaseLogManager from '../../../managers/CaseLogManager';
import Route from '../../../Route';

enum HasuraAction {
	INSERT = 'insert',
	UPDATE = 'update',
	DELETE = 'delete',
	MANUAL = 'update',
}

interface HasuraEventPayload {
	event: {
		session_variables: any;
		op: keyof typeof HasuraAction;
		data: {
			old: any;
			new: any;
		};
	};
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
export default class HasuraEventHookRoute extends Route {
	public middleware = [
		validate(
			Joi.object({
				event: Joi.object({
					session_variables: Joi.object(),
					op: Joi.valid('INSERT', 'UPDATE', 'DELETE', 'MANUAL').required(),
					data: Joi.object({
						old: Joi.object(),
						new: Joi.object(),
					}).required(),
				}).required(),
				created_at: Joi.date().required(),
				id: Joi.string().required(),
				trigger: Joi.object({
					name: Joi.string().required(),
				}).required(),
				table: Joi.object({
					schema: Joi.string().required(),
					name: Joi.string().required(),
				}).required(),
			}).required(),
		),
	];

	public constructor(public caseLogManager: CaseLogManager) {
		super();
	}

	public handle(req: Request, res: Response, next: NextHandler) {
		if (!req.body) return next(new Error('uh oh, something broke'));

		const body: HasuraEventPayload = req.body as any;
		switch (body.table.name) {
			case 'cases': {
				switch (body.event.op) {
					case 'UPDATE':
					case 'MANUAL':
						// this.caseLogManager.update(body.event.data.new);
						break;
					case 'INSERT':
						void this.caseLogManager.create(body.event.data.new);
						break;
					case 'DELETE':
						// this.caseLogManager.delete(body.event.data.old);
						break;
				}
			}
		}

		res.statusCode = 200;
		res.end();
	}
}
