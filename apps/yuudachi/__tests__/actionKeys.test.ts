import i18next from "i18next";
import { describe, expect, it } from "vitest";
import { CaseAction } from "../src/functions/cases/createCase.js";
import { ReportStatus } from "../src/functions/reports/createReport.js";
import { caseActionLabel, reportStatusLabel } from "../src/util/actionKeys.js";

const locale = "en-US";

describe("caseActionLabel", () => {
	it("returns restriction label", () => {
		expect(caseActionLabel(CaseAction.Role, locale)).toBe(
			i18next.t("log.history.cases.action_label.restriction", { lng: locale }),
		);
	});

	it("returns case-specific label when flagged", () => {
		expect(caseActionLabel(CaseAction.Unrole, locale, true)).toBe(
			i18next.t("log.history.cases.action_label.unrestriction_case", { lng: locale }),
		);
	});

	it("returns fallback for unknown action", () => {
		expect(caseActionLabel(999 as CaseAction, locale)).toBe(
			i18next.t("log.history.cases.action_label.unknown", { lng: locale }),
		);
	});
});

describe("reportStatusLabel", () => {
	it("maps known statuses", () => {
		expect(reportStatusLabel(ReportStatus.Pending, locale)).toBe(
			i18next.t("log.history.reports.status_label.pending", { lng: locale }),
		);
		expect(reportStatusLabel(ReportStatus.Approved, locale)).toBe(
			i18next.t("log.history.reports.status_label.approved", { lng: locale }),
		);
		expect(reportStatusLabel(ReportStatus.Spam, locale)).toBe(
			i18next.t("log.history.reports.status_label.spam", { lng: locale }),
		);
	});

	it("falls back to unknown", () => {
		expect(reportStatusLabel(999 as ReportStatus, locale)).toBe(
			i18next.t("log.history.reports.status_label.unknown", { lng: locale }),
		);
	});
});
