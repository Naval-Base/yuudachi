import type { Snowflake } from 'discord-api-types/v8';
import { container } from 'tsyringe';
import API from '@yuudachi/api';
import { CaseAction } from '@yuudachi/types';

import { checkAuth } from '../../util/checkAuth';

export default async (
	_: any,
	args: {
		guild_id: Snowflake;
		action: CaseAction;
		reason?: string;
		moderatorId: Snowflake;
		targetId: Snowflake;
		contextMessageId?: Snowflake;
		referenceId?: number;
	},
) => {
	const api = container.resolve(API);

	if (!(await checkAuth(args.guild_id))) {
		return [];
	}

	const cases = await api.guilds.createCase(args.guild_id, {
		action: CaseAction.UNBAN,
		reason: args.reason,
		moderatorId: args.moderatorId,
		targetId: args.targetId,
		contextMessageId: args.contextMessageId,
		referenceId: args.referenceId,
	});

	return cases;
};
