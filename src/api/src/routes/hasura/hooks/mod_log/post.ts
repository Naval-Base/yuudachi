import Joi from 'joi';
import type { Request, Response, NextHandler } from 'polka';
import { injectable } from 'tsyringe';
import { Route } from '@yuudachi/http';
import { bodyParser } from '@yuudachi/core';

import { validate } from '../../../../middleware';
import CaseLogManager from '../../../../managers/CaseLogManager';
import type { RawCase } from '../../../../managers/CaseManager';

enum HasuraAction {
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
	MANUAL = 'UPDATE',
}

interface HasuraMogLogEventPayload {
	event: {
		session_variables: Record<string, string> | null;
		op: keyof typeof HasuraAction;
		data: {
			old: Record<string, unknown> | null;
			new: Record<string, unknown> | null;
		};
		trace_context: unknown;
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
							session_variables: Joi.object().allow(null),
							op: Joi.string().valid('INSERT', 'UPDATE', 'DELETE', 'MANUAL').required(),
							data: Joi.object({
								old: Joi.object().allow(null),
								new: Joi.object().allow(null),
							}).required(),
							trace_context: Joi.object().allow(null),
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

		const body: HasuraMogLogEventPayload = req.body;
		switch (body.event.op) {
			case 'UPDATE':
			case 'MANUAL':
				void this.caseLogManager.create(body.event.data.new as unknown as RawCase);
				break;
			case 'INSERT':
				if (!body.event.data.new) break;
				void this.caseLogManager.create(body.event.data.new as unknown as RawCase);
				break;
		}

		res.statusCode = 200;
		res.end();
	}
}
