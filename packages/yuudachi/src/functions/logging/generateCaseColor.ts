import { Case, CaseAction } from '../cases/createCase.js';

export function generateCaseColor(case_: Case) {
	switch (case_.action) {
		case CaseAction.Role:
		case CaseAction.Warn:
		case CaseAction.Timeout:
			return 16767836;
		case CaseAction.Kick:
		case CaseAction.Softban:
			return 16225364;
		case CaseAction.Ban:
			return 16735324;
		case CaseAction.Unban:
			return 6094749;
		case CaseAction.Unrole:
		default:
			return 3092790;
	}
}
