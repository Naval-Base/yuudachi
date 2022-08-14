import type { ArgsParam, InteractionParam } from '../../../../Command.js';
import type { ReportCommand } from '../../../../interactions/index.js';
export async function user(
	// @ts-expect-error
	interaction: InteractionParam,
	// @ts-expect-error
	args: ArgsParam<typeof ReportCommand>['user'],
	// @ts-expect-error
	locale: string,

	// eslint-disable-next-line @typescript-eslint/no-empty-function
) {}
