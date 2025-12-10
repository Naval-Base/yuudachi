import { describe, expect, it } from "vitest";
import { CaseAction } from "../src/functions/cases/createCase.js";
import { ReportStatus } from "../src/functions/reports/createReport.js";
import { caseActionLabel, reportStatusLabel } from "../src/util/actionKeys.js";

describe("caseActionLabel", () => {
	it("returns restriction label", () => {
		expect(caseActionLabel(CaseAction.Role, "en")).toBe("log.history.cases.action_label.restriction:en");
	});

	it("returns case-specific label when flagged", () => {
		expect(caseActionLabel(CaseAction.Unrole, "en", true)).toBe("log.history.cases.action_label.unrestriction_case:en");
	});

	it("returns fallback for unknown action", () => {
		expect(caseActionLabel(999 as CaseAction, "en")).toBe("log.history.cases.action_label.unknown:en");
	});
});

describe("reportStatusLabel", () => {
	it("maps known statuses", () => {
		expect(reportStatusLabel(ReportStatus.Pending, "en")).toBe("log.history.reports.status_label.pending:en");
		expect(reportStatusLabel(ReportStatus.Approved, "en")).toBe("log.history.reports.status_label.approved:en");
		expect(reportStatusLabel(ReportStatus.Spam, "en")).toBe("log.history.reports.status_label.spam:en");
	});

	it("falls back to unknown", () => {
		expect(reportStatusLabel(999 as ReportStatus, "en")).toBe("log.history.reports.status_label.unknown:en");
	});
});
