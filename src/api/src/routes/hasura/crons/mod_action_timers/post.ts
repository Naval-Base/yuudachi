import type { Snowflake } from 'discord-api-types/v8';
import type { Request, Response } from 'polka';
import { inject, injectable } from 'tsyringe';
import { Route } from '@yuudachi/http';
import { Tokens } from '@yuudachi/core';
import type { Sql } from 'postgres';

const { kSQL } = Tokens;

import CaseManager from '../../../../managers/CaseManager';

@injectable()
export default class HasuraModActionTimersCron extends Route {
	public constructor(@inject(kSQL) public readonly sql: Sql<any>, public readonly caseManager: CaseManager) {
		super();
	}

	public async handle(_: Request, res: Response) {
		const currentCases = await this.sql<[{ guild_id: Snowflake; case_id: number; action_expiration: string }]>`
			select guild_id, case_id, action_expiration
			from cases
			where action_processed = false`;

		for (const case_ of currentCases) {
			if (Date.parse(case_.action_expiration) <= Date.now()) {
				void this.caseManager.delete(case_.guild_id, case_.case_id);
			}
		}

		res.statusCode = 200;
		res.end();
	}
}
