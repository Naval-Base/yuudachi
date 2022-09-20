import { on } from "node:events";
import { setTimeout as pSetTimeout } from "node:timers/promises";
import type { ThreadChannel } from "discord.js";
import { AuditLogEvent, Client, Events } from "discord.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Sql } from "postgres";
import { inject, injectable } from "tsyringe";
import type { Event } from "../../Event.js";
import { upsertReportLog } from "../../functions/logging/upsertReportLog.js";
import { type RawReport, transformReport } from "../../functions/reports/transformReport.js";
import { updateReport } from "../../functions/reports/updateReport.js";
import { type ReportStatusTagTuple, getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import { logger } from "../../logger.js";
import { kSQL } from "../../tokens.js";
import { arrayEquals } from "../../util/arrays.js";

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
				const reportStatusTags = await getGuildSetting<ReportStatusTagTuple>(
					oldPost.guildId,
					SettingsKeys.ReportStatusTags,
				);

				const oldStatusTags = oldPost.appliedTags.filter((tag) => reportStatusTags.includes(tag));
				const newStatusTags = newPost.appliedTags.filter((tag) => reportStatusTags.includes(tag));

				if (oldStatusTags.length !== 1 && newStatusTags.length === 1) {
					const [rawReport] = await this.sql<[RawReport]>`
						select *
						from reports
						where guild_id = ${oldPost.guildId}
							and log_post_id = ${oldPost.id}
					`;

					if (rawReport) {
						await pSetTimeout(1_500);
						const auditLogs = await oldPost.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.ThreadUpdate });
						const auditLog = auditLogs.entries.find(
							(entry) =>
								entry.target.id === oldPost.id &&
								arrayEquals(entry.changes[0]?.new as string[] | undefined, newPost.appliedTags) &&
								arrayEquals(entry.changes[0]?.old as string[] | undefined, oldPost.appliedTags),
						);

						const [statusTag] = newStatusTags;
						const oldReport = transformReport(rawReport);
						const reportStatusTag = reportStatusTags[oldReport.status];

						if (statusTag && statusTag !== reportStatusTag) {
							const report = await updateReport(
								{
									...oldReport,
									status: reportStatusTags.indexOf(statusTag),
								},
								auditLog?.executor ?? undefined,
							);
							await upsertReportLog(oldPost.guild, report, undefined);
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
