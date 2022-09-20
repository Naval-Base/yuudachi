import { on } from "node:events";
import type { ThreadChannel } from "discord.js";
import { Client, Events } from "discord.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Sql } from "postgres";
import { inject, injectable } from "tsyringe";
import type { Event } from "../../Event.js";
import { upsertReportLog } from "../../functions/logging/upsertReportLog.js";
import { type RawReport, transformReport } from "../../functions/reports/transformReport.js";
import { updateReport } from "../../functions/reports/updateReport.js";
import {
	type ReportStatusLabelTuple,
	getGuildSetting,
	SettingsKeys,
} from "../../functions/settings/getGuildSetting.js";
import { logger } from "../../logger.js";
import { kSQL } from "../../tokens.js";

@injectable()
export default class implements Event {
	public name = "Manual report status change";

	public event = Events.ThreadUpdate as const;

	public constructor(public readonly client: Client<true>, @inject(kSQL) public readonly sql: Sql<any>) {}

	public async execute(): Promise<void> {
		for await (const [oldPost, newPost] of on(this.client, this.event) as AsyncIterableIterator<
			[ThreadChannel, ThreadChannel]
		>) {
			try {
				const reportStatusLabels = await getGuildSetting<ReportStatusLabelTuple>(
					oldPost.guildId,
					SettingsKeys.ReportStatusLabels,
				);

				const oldStatusTags = oldPost.appliedTags.filter((tag) => reportStatusLabels.includes(tag));
				const newStatusTags = newPost.appliedTags.filter((tag) => reportStatusLabels.includes(tag));

				if (oldStatusTags.length !== 1 && newStatusTags.length === 1) {
					const [rawReport] = await this.sql<[RawReport]>`
						select *
						from reports
						where guild_id = ${oldPost.guildId}
							and log_message_id = ${oldPost.id}
					`;

					if (rawReport) {
						const [statusTag] = newStatusTags;
						const oldReport = transformReport(rawReport);
						const reportStatusLabel = reportStatusLabels[oldReport.status];

						if (statusTag && statusTag !== reportStatusLabel) {
							const report = await updateReport({
								...oldReport,
								status: reportStatusLabels.indexOf(statusTag),
							});
							await upsertReportLog(oldPost.guild, report);
						}
					}
				}
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}
