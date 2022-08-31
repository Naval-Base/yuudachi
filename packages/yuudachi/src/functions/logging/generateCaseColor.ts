import { type Case, CaseAction } from "../cases/createCase.js";

export function generateCaseColor(case_: Case) {
	switch (case_.action) {
		case CaseAction.Role:
		case CaseAction.Warn:
		case CaseAction.Timeout:
			return 16_767_836;
		case CaseAction.Kick:
		case CaseAction.Softban:
			return 16_225_364;
		case CaseAction.Ban:
			return 16_735_324;
		case CaseAction.Unban:
			return 6_094_749;
		default:
			return 3_092_790;
	}
}
