import { on } from "node:events";
import type { ThreadChannel } from "discord.js";
import { Client, Events } from "discord.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Sql } from "postgres";
import { inject, injectable } from "tsyringe";
import type { Event } from "../../Event.js";
import { resolveLabelToStatus, resolveStatusLabel, upsertReportLog } from "../../functions/logging/upsertReportLog.js";
import type { RawReport } from "../../functions/reports/transformReport.js";
import { transformReport } from "../../functions/reports/transformReport.js";
import { updateReport } from "../../functions/reports/updateReport.js";
import type { ReportLabels } from "../../functions/settings/getGuildSetting.js";
import { REPORT_STATUS_KEYS, getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
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
				const reportLabels = await getGuildSetting<ReportLabels>(oldPost.guildId, SettingsKeys.ReportLabels);
				const reportLabelIds = Object.entries(reportLabels).reduce<string[]>((acc, [key, val]) => {
					if (REPORT_STATUS_KEYS.includes(key)) {
						acc.push(val);
					}

					return acc;
				}, []);

				const oldStatusTags = oldPost.appliedTags.filter((tag) => reportLabelIds.includes(tag));
				const newStatusTags = newPost.appliedTags.filter((tag) => reportLabelIds.includes(tag));

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
						const reportStatusLabel = resolveStatusLabel(reportLabels, oldReport);

						if (statusTag && statusTag !== reportStatusLabel) {
							const report = await updateReport({
								...oldReport,
								status: resolveLabelToStatus(reportLabels, statusTag),
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
