import i18next from "i18next";
import { CaseAction } from "../functions/cases/createCase.js";
import { ReportStatus } from "../functions/reports/createReport.js";

export function caseActionLabel(key: CaseAction, locale: string) {
	switch (key) {
		case CaseAction.Role:
			return i18next.t("log.history.cases.action_label.restriction", { lng: locale });
		case CaseAction.Warn:
			return i18next.t("log.history.cases.action_label.warn", { lng: locale });
		case CaseAction.Kick:
			return i18next.t("log.history.cases.action_label.kick", { lng: locale });
		case CaseAction.Softban:
			return i18next.t("log.history.cases.action_label.softban", { lng: locale });
		case CaseAction.Ban:
			return i18next.t("log.history.cases.action_label.ban", { lng: locale });
		case CaseAction.Unban:
			return i18next.t("log.history.cases.action_label.unban", { lng: locale });
		case CaseAction.Timeout:
			return i18next.t("log.history.cases.action_label.timeout", { lng: locale });
		default:
			return i18next.t("log.history.cases.action_label.unknown", { lng: locale });
	}
}

export function reportStatusLabel(key: ReportStatus, locale: string) {
	switch (key) {
		case ReportStatus.Pending:
			return i18next.t("log.history.reports.status_label.pending", { lng: locale });
		case ReportStatus.Approved:
			return i18next.t("log.history.reports.status_label.approved", { lng: locale });
		case ReportStatus.Rejected:
			return i18next.t("log.history.reports.status_label.rejected", { lng: locale });
		case ReportStatus.Spam:
			return i18next.t("log.history.reports.status_label.spam", { lng: locale });
		default:
			return i18next.t("log.history.reports.status_label.unknown", { lng: locale });
	}
}
