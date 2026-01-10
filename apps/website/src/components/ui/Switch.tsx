"use client";

import type { VariantProps } from "cva";
import { CheckIcon } from "lucide-react";
import { composeRenderProps, Switch as RACSwitch } from "react-aria-components";
import type { SwitchProps as RACSwitchProps } from "react-aria-components";
import { Description, Label } from "@/components/ui/Field";
import { compose, cva, cx } from "@/styles/cva";
import { focusRing } from "@/styles/ui/focusRing";
import { composeTailwindRenderProps } from "@/styles/util";

export const switchStyles = compose(
	focusRing,
	cva({
		base: "relative isolate inline-flex rounded-3xl border border-transparent px-px py-px transition forced-colors:bg-[Highlight]",
		variants: {
			variant: {
				default: [
					"bg-base-neutral-500 text-base-neutral-800 dark:bg-base-neutral-300 dark:text-base-neutral-100",
					"group-hover:bg-base-neutral-400",
					"group-focus-visible:bg-base-neutral-400",
					"group-disabled:cursor-default group-disabled:bg-base-neutral-200 dark:group-disabled:bg-base-neutral-700",
					"group-selected:bg-base-neutral-800 group-selected:dark:bg-base-neutral-100",
					"group-selected:group-hover:bg-base-neutral-600 group-selected:dark:group-hover:bg-base-neutral-300",
					"group-selected:group-focus-visible:bg-base-neutral-600 group-selected:dark:group-focus-visible:bg-base-neutral-300",
					"group-selected:group-pressed:bg-base-neutral-200 group-selected:dark:group-pressed:bg-base-neutral-700",
				],
				tangerine: [
					"bg-base-neutral-500 text-base-neutral-800 dark:bg-base-neutral-300 dark:text-base-neutral-100",
					"group-hover:bg-base-neutral-400",
					"group-focus-visible:bg-base-neutral-400",
					"group-disabled:cursor-default group-disabled:bg-base-neutral-200 dark:group-disabled:bg-base-neutral-700",
					"group-selected:bg-base-tangerine-600 group-selected:dark:bg-base-tangerine-400",
					"group-selected:group-hover:bg-base-tangerine-400 group-selected:dark:group-hover:bg-base-tangerine-600",
					"group-selected:group-focus-visible:bg-base-tangerine-400 group-selected:dark:group-focus-visible:bg-base-tangerine-600",
					"group-selected:group-pressed:bg-base-neutral-200 group-selected:dark:group-pressed:bg-base-neutral-700",
				],
			},
			size: {
				default: "h-6 w-10",
				sm: "h-5 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}),
);

export type SwitchProps = RACSwitchProps &
	VariantProps<typeof switchStyles> & {
		readonly description?: string;
		readonly label?: string;
	};

export function Switch(props: SwitchProps) {
	return (
		<RACSwitch
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"group has-[[slot=description]]:**:data-[slot=label]:text-base-label-md relative grid grid-cols-[1fr_auto] place-items-center gap-2 disabled:opacity-38 *:data-[slot=indicator]:col-start-1 *:data-[slot=indicator]:place-self-start *:data-[slot=label]:col-start-2 *:data-[slot=label]:row-start-1 *:[[slot=description]]:col-start-2 *:[[slot=description]]:row-start-2 *:[[slot=description]]:place-self-start",
			)}
			data-slot="control"
			style={({ defaultStyle }) => ({
				...defaultStyle,
				WebkitTapHighlightColor: "transparent",
			})}
		>
			{composeRenderProps(props.children, (children, values) => {
				const isStringChild = typeof children === "string";
				const hasCustomChildren = typeof children !== "undefined";

				const content = hasCustomChildren ? (
					isStringChild ? (
						<Label>{children}</Label>
					) : (
						children
					)
				) : (
					<>
						{props.label && <Label elementType="span">{props.label}</Label>}
						{props.description && <Description>{props.description}</Description>}
					</>
				);

				return (
					<>
						<span
							className={switchStyles({ ...values, variant: props.variant, size: props.size })}
							data-slot="indicator"
						>
							<span
								aria-hidden
								className={cx(
									"pointer-events-none relative flex size-5 origin-right place-content-center place-items-center rounded-3xl bg-base-neutral-0 transition-all duration-200 group-pressed:w-6 group-selected:ml-4 group-selected:group-pressed:ml-2 *:data-[slot=icon]:size-4 *:data-[slot=icon]:shrink-0 dark:bg-base-neutral-800 forced-colors:disabled:outline-[GrayText]",
									props.size === "sm" && "size-4 group-pressed:w-5 group-selected:group-pressed:ml-3",
								)}
							>
								{values.isSelected && props.size !== "sm" ? (
									<CheckIcon aria-hidden data-slot="icon" size={18} strokeWidth={1.5} />
								) : null}
							</span>
						</span>
						{content}
					</>
				);
			})}
		</RACSwitch>
	);
}
