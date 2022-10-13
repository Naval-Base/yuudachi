import i18next from "i18next";

export const ACTION_KEYS = ["restriction", "", "warn", "kick", "softban", "ban", "unban", "timeout", ""] as const;
export const REPORT_KEYS = ["pending", "approved", "rejected", "spam"] as const;

export function actionKeyLabel(key: typeof ACTION_KEYS[number], locale: string) {
	switch (key) {
		case "restriction":
			return i18next.t("log.history.cases.action_label.restriction", { lng: locale });
		case "warn":
			return i18next.t("log.history.cases.action_label.warn", { lng: locale });
		case "kick":
			return i18next.t("log.history.cases.action_label.kick", { lng: locale });
		case "softban":
			return i18next.t("log.history.cases.action_label.softban", { lng: locale });
		case "ban":
			return i18next.t("log.history.cases.action_label.ban", { lng: locale });
		case "unban":
			return i18next.t("log.history.cases.action_label.unban", { lng: locale });
		case "timeout":
			return i18next.t("log.history.cases.action_label.timeout", { lng: locale });
		default:
			return i18next.t("log.history.cases.action_label.unknown", { lng: locale });
	}
}

export function reportKeyLabel(key: typeof REPORT_KEYS[number], locale: string) {
	switch (key) {
		case "pending":
			return i18next.t("log.history.reports.status_label.pending", { lng: locale });
		case "approved":
			return i18next.t("log.history.reports.status_label.approved", { lng: locale });
		case "rejected":
			return i18next.t("log.history.reports.status_label.rejected", { lng: locale });
		case "spam":
			return i18next.t("log.history.reports.status_label.spam", { lng: locale });
		default:
			return i18next.t("log.history.reports.status_label.unknown", { lng: locale });
	}
}
