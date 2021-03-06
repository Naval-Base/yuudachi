import { container } from 'tsyringe';
import API from '@yuudachi/api';
import { CaseAction } from '@yuudachi/types';

export default async (
	_: any,
	args: {
		guild_id: `${bigint}`;
		action: CaseAction;
		reason?: string;
		moderatorId: `${bigint}`;
		targetId: `${bigint}`;
		contextMessageId?: `${bigint}`;
		referenceId?: number;
	},
) => {
	const api = container.resolve(API);
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
