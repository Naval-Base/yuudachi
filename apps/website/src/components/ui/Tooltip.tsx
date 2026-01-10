"use client";

import type { VariantProps } from "cva";
import type { ReactNode } from "react";
import type { TooltipProps as RACTooltipProps } from "react-aria-components";
import { OverlayArrow as RACOverlayArrow, Tooltip as RACTooltip, composeRenderProps } from "react-aria-components";
import { cva } from "@/styles/cva";

const tooltipStyles = cva({
	base: "group will-change-transform",
	variants: {
		variant: {
			default:
				"rounded-sm bg-base-neutral-700 px-2 py-1 text-base-sm text-base-neutral-40 dark:bg-base-neutral-200 dark:text-base-neutral-900",
			plain:
				"rounded-sm bg-base-neutral-900 px-4 py-[10px] text-base-sm text-base-neutral-40 shadow-base-sm dark:bg-base-neutral-80 dark:text-base-neutral-900 [&_.arx]:fill-base-neutral-900 dark:[&_.arx]:fill-base-neutral-80",
			rich: "max-w-[248px] rounded-lg bg-base-neutral-100 p-4 text-base-md text-base-neutral-900 shadow-base-sm dark:border-base-neutral-700 dark:bg-base-neutral-700 dark:text-base-neutral-40",
		},
		isEntering: {
			true: "animate-in fade-in placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 placement-top:slide-in-from-bottom-1 placement-bottom:slide-in-from-top-1",
		},
		isExiting: {
			true: "animate-in direction-reverse fade-in placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 placement-top:slide-out-to-bottom-1 placement-bottom:slide-out-to-top-1",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type TooltipContentProps = Omit<RACTooltipProps, "children"> &
	VariantProps<typeof tooltipStyles> & {
		readonly children?: ReactNode;
		readonly showArrow?: boolean;
	};

export function TooltipContent({ offset = 12, showArrow = true, ...props }: TooltipContentProps) {
	return (
		<RACTooltip
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				tooltipStyles({
					...renderProps,
					variant: props.variant,
					className,
				}),
			)}
			offset={offset}
		>
			{showArrow && (
				<RACOverlayArrow className="group">
					<svg
						className="arx block group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180 forced-colors:fill-[Canvas] forced-colors:stroke-[ButtonBorder]"
						height={4}
						viewBox="0 0 8 4"
						width={8}
					>
						<path d="M0 0 L4 4 L8 0" />
					</svg>
				</RACOverlayArrow>
			)}
			{props.children}
		</RACTooltip>
	);
}

export { Button as TooltipTrigger } from "@/components/ui/Button";
export { TooltipTrigger as Tooltip } from "react-aria-components";
