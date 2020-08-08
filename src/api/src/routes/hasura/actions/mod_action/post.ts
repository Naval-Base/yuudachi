import Joi from 'joi';
import { Request, Response, NextHandler } from 'polka';
import { injectable } from 'tsyringe';

import Route from '../../../../Route';
import { validate, bodyParser } from '../../../../middleware';
import CaseManager, { Case } from '../../../../managers/CaseManager';

enum Actions {
	MOD_ACTION = 'mod_action',
}

interface ModActionPayload {
	action: {
		name: Actions.MOD_ACTION;
	};
	input: {
		modActionInput: Case;
	};
	session_variables: Record<string, string>;
}

@injectable()
export default class HasuraModActionHandler extends Route {
	public constructor(public readonly caseManager: CaseManager) {
		super();
	}

	public middleware = [
		bodyParser,
		validate(
			Joi.object()
				.keys({
					action: Joi.object()
						.keys({
							name: Joi.string().required(),
						})
						.required(),
					input: Joi.object()
						.keys({
							modActionInput: Joi.object().required(),
						})
						.required(),
					session_variables: Joi.object().required(),
				})
				.required(),
		),
	];

	public async handle(req: Request, res: Response, next: NextHandler) {
		if (!req.body) {
			return next('uh oh, something broke');
		}

		const body: ModActionPayload = req.body as any;
		await this.caseManager.create(body.input.modActionInput);

		res.statusCode = 201;
		res.end();
	}
}
