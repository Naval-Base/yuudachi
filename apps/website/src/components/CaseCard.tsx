import { format } from "@lukeed/ms";
import { Card } from "./Card";

enum CaseAction {
	Role,
	Unrole,
	Warn,
	Kick,
	Softban,
	Ban,
	Unban,
	Timeout,
	TimeoutEnd,
}

function caseActionLabel(key: CaseAction) {
	switch (key) {
		case CaseAction.Role:
			return "Role";
		case CaseAction.Unrole:
			return "Unrole";
		case CaseAction.Warn:
			return "Warn";
		case CaseAction.Kick:
			return "Kick";
		case CaseAction.Softban:
			return "Softban";
		case CaseAction.Ban:
			return "Ban";
		case CaseAction.Unban:
			return "Unban";
		case CaseAction.Timeout:
			return "Timeout";
		case CaseAction.TimeoutEnd:
			return "TimeoutEnd";
		default:
			return "Unknown";
	}
}

function generateCaseColor(key: CaseAction) {
	// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
	switch (key) {
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

export function CaseCard({ case_ }: { readonly case_: any }) {
	const createdAt = new Date(case_.created_at);

	return (
		<Card>
			<div className="flex">
				<div
					className="rounded-l-lg border-4"
					style={{ borderColor: `#${generateCaseColor(case_.action).toString(16)}` }}
				/>
				<div className="flex flex-col p-4">
					<div>
						<span className="font-semibold">Action:</span> {caseActionLabel(case_.action)}
					</div>
					<div className="from-light-900 dark:from-dark-100 my-2 h-px bg-linear-to-r" role="separator" />
					<div>
						<span className="font-semibold">Moderator:</span> {case_.mod_tag}
					</div>
					<div className="from-light-900 dark:from-dark-100 my-2 h-px bg-linear-to-r" role="separator" />
					<div>
						<span className="font-semibold">Reason:</span> {case_.reason}
					</div>
					<div className="from-light-900 dark:from-dark-100 my-2 h-px bg-linear-to-r" role="separator" />
					<div>
						<span className="font-semibold">Date:</span> {new Intl.DateTimeFormat("en-GB").format(createdAt)} (
						{format(Date.now() - createdAt.getTime(), true)} ago)
					</div>
				</div>
			</div>
		</Card>
	);
}
