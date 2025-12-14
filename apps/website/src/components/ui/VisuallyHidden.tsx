"use client";

import type { PropsWithChildren } from "react";
import { useVisuallyHidden } from "react-aria";

export function VisuallyHidden(props: PropsWithChildren) {
	const { visuallyHiddenProps } = useVisuallyHidden();

	return <span {...visuallyHiddenProps}>{props.children}</span>;
}
