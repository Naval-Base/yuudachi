import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
	return (
		<div className="bg-light-200 dark:bg-dark-800 dark:border-dark-100 rounded-lg border shadow-sm">{children}</div>
	);
}
