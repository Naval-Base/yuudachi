import { compose, cva } from "@/styles/cva";
import { focusRing } from "@/styles/ui/focusRing";

export const linkStyles = compose(
	focusRing,
	cva({
		base: "rounded-sm transition-[color,opacity]",
		variants: {
			variant: {
				unset: null,
				default: [
					"text-base-tangerine-500",
					"hover:text-base-tangerine-500 hover:underline",
					"focus-visible:text-base-tangerine-500 focus-visible:underline",
					"pressed:text-base-tangerine-600 pressed:underline dark:pressed:text-base-tangerine-400",
					"disabled:text-base-tangerine-900/38 dark:disabled:text-base-tangerine-40/38 disabled:underline",
				],
				breadcrumb: [
					"text-base-neutral-600 dark:text-base-neutral-300",
					"hover:text-base-neutral-600 dark:hover:text-base-neutral-300 hover:underline",
					"focus-visible:text-base-neutral-600 dark:focus-visible:text-base-neutral-300 focus-visible:underline",
					"pressed:text-base-neutral-700 dark:pressed:text-base-neutral-100 pressed:underline",
					"disabled:text-base-neutral-900 dark:disabled:text-base-neutral-300",
				],
			},
			isDisabled: {
				true: "cursor-default opacity-38 forced-colors:text-[GrayText]",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}),
);
