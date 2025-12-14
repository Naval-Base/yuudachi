"use client";

import type { VariantProps } from "cva";
import { composeRenderProps, Link as RACLink } from "react-aria-components";
import type { LinkProps as RACLinkProps } from "react-aria-components";
import { linkStyles } from "@/styles/ui/link";

export type LinkProps = RACLinkProps & VariantProps<typeof linkStyles>;

export function Link(props: LinkProps) {
	return (
		<RACLink
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				linkStyles({
					...renderProps,
					variant: props.variant,
					className,
				}),
			)}
		>
			{(values) => <>{typeof props.children === "function" ? props.children(values) : props.children}</>}
		</RACLink>
	);
}
