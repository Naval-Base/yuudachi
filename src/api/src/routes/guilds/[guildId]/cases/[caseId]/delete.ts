import { Case } from '@yuudachi/types';
import { forbidden, notFound } from '@hapi/boom';
import { Request, Response } from 'polka';
import { injectable } from 'tsyringe';
import { Route } from '@yuudachi/http';
import { HttpException } from '@yuudachi/rest';

import CaseManager from '../../../../../managers/CaseManager';

@injectable()
export default class DeleteCaseRoute extends Route {
	public constructor(public readonly caseManager: CaseManager) {
		super();
	}

	public async handle(req: Request, res: Response) {
		let case_: Case;
		try {
			case_ = await this.caseManager.delete(req.params.guildId, Number(req.params.caseId), true);
		} catch (e) {
			if (e instanceof HttpException) {
				switch (e.status) {
					case 403:
						throw forbidden(e.body);
					case 404:
						throw notFound(e.body);
				}
			}

			throw e;
		}

		res.statusCode = 201;
		res.setHeader('content-type', 'application/json; charset=utf-8');
		res.end(JSON.stringify({ case: case_ }));
	}
}
