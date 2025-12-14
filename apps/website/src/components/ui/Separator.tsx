"use client";

import { Separator as RACSeparator, type SeparatorProps as RACSeparatorProps } from "react-aria-components";
import { cva } from "@/styles/cva";

const separatorStyles = cva({
	base: "bg-base-neutral-100 text-base-neutral-100 dark:bg-base-neutral-700 dark:text-base-neutral-700 shrink-0 forced-colors:bg-[ButtonBorder]",
	variants: {
		orientation: {
			horizontal: "mx-3 my-2 h-px",
			vertical: "h-full w-px",
		},
		isDisabled: {
			true: "opacity-38 forced-colors:border forced-colors:border-[GrayText]",
			false: null,
		},
	},
	defaultVariants: {
		orientation: "horizontal",
	},
});

export type SeparatorProps = RACSeparatorProps & {
	readonly className?: string;
	readonly isDisabled?: boolean;
};

export function Separator(props: SeparatorProps) {
	return (
		<RACSeparator
			{...props}
			className={separatorStyles({
				className: props.className,
				isDisabled: props.isDisabled,
				orientation: props.orientation,
			})}
		/>
	);
}
