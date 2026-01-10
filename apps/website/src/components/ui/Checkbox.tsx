"use client";

import { CheckIcon, MinusIcon } from "lucide-react";
import { CheckboxGroup as RACCheckboxGroup, Checkbox as RACCheckbox, composeRenderProps } from "react-aria-components";
import type {
	CheckboxGroupProps as RACCheckboxGroupProps,
	CheckboxProps as RACCheckboxProps,
} from "react-aria-components";
import { Description, Label } from "@/components/ui/Field";
import { compose, cva, cx } from "@/styles/cva";
import { focusRing } from "@/styles/ui/focusRing";
import { composeTailwindRenderProps } from "@/styles/util";

export type CheckboxGroupProps = RACCheckboxGroupProps & {
	readonly description?: string;
	readonly label?: string;
};

export function CheckboxGroup(props: CheckboxGroupProps) {
	return (
		<RACCheckboxGroup
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"space-y-2 has-[[slot=description]]:space-y-2 **:[[slot=description]]:block",
			)}
		/>
	);
}

const boxStyles = compose(
	focusRing,
	cva({
		base: "flex shrink-0 place-content-center place-items-center transition",
		variants: {
			variant: {
				unset: null,
				default: [
					"size-4 rounded-xs border-[1.5px] *:data-[slot=check-indicator]:size-3.5",
					"border-base-neutral-300 bg-base-neutral-0 text-base-neutral-40 dark:border-base-neutral-300 dark:bg-base-neutral-800",
					"group-hover:border-base-neutral-200 dark:group-hover:border-base-neutral-600",
					"group-focus-visible:border-base-neutral-200 dark:group-focus-visible:border-base-neutral-600",
					"group-pressed:border-base-neutral-100 dark:group-pressed:border-base-neutral-700",
					"group-invalid:border-base-sunset-500",
					"group-invalid:group-hover:border-base-sunset-200 dark:group-invalid:group-hover:border-base-sunset-700",
					"group-invalid:group-focus-visible:border-base-sunset-200 dark:group-invalid:group-focus-visible:border-base-sunset-700",
					"group-invalid:group-pressed:border-base-sunset-100 dark:group-invalid:group-pressed:border-base-sunset-800",
				],
			},
			isSelected: {
				true: [
					"border-transparent bg-base-neutral-700 dark:border-transparent dark:bg-base-neutral-100 dark:text-base-neutral-900",
					"group-hover:border-transparent group-hover:bg-base-neutral-500 dark:group-hover:border-transparent dark:group-hover:bg-base-neutral-300",
					"group-focus-visible:border-transparent group-focus-visible:bg-base-neutral-500 dark:group-focus-visible:border-transparent dark:group-focus-visible:bg-base-neutral-300",
					"group-pressed:border-transparent group-pressed:bg-base-neutral-400 group-pressed:text-base-neutral-800 dark:group-pressed:border-transparent dark:group-pressed:bg-base-neutral-400 dark:group-pressed:text-base-neutral-900",
					"group-invalid:bg-base-sunset-500 group-invalid:text-base-neutral-900",
					"group-invalid:group-hover:bg-base-sunset-200 dark:group-invalid:group-hover:bg-base-sunset-700 dark:group-invalid:group-hover:text-base-neutral-40",
					"group-invalid:group-focus-visible:bg-base-sunset-200 dark:group-invalid:group-focus-visible:bg-base-sunset-700 dark:group-invalid:group-focus-visible:text-base-neutral-40",
					"group-invalid:group-pressed:bg-base-sunset-100 dark:group-invalid:group-pressed:bg-base-sunset-800 dark:group-invalid:group-pressed:text-base-neutral-40",
				],
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}),
);

export type CheckboxProps = RACCheckboxProps & {
	readonly classNames?: {
		readonly boxContainer?: string;
	};
	readonly description?: string;
	readonly label?: string;
};

export function Checkbox(props: CheckboxProps) {
	return (
		<RACCheckbox {...props} className={composeTailwindRenderProps(props.className, "group block disabled:opacity-38")}>
			{composeRenderProps(props.children, (children, { isSelected, isIndeterminate, ...renderProps }) => {
				const isStringChild = typeof children === "string";
				const hasCustomChildren = typeof children !== "undefined";

				const indicator = isIndeterminate ? (
					<MinusIcon aria-hidden data-slot="check-indicator" size={18} strokeWidth={1.5} />
				) : isSelected ? (
					<CheckIcon aria-hidden data-slot="check-indicator" size={18} strokeWidth={1.5} />
				) : null;

				const content = hasCustomChildren ? (
					isStringChild ? (
						<Label>{children}</Label>
					) : (
						children
					)
				) : (
					<>
						{props.label && <Label>{props.label}</Label>}
						{props.description && <Description>{props.description}</Description>}
					</>
				);

				return (
					<div
						className={cx(
							"grid grid-cols-[1rem_1fr]",
							"*:data-[slot=indicator]:col-start-1 *:data-[slot=indicator]:row-start-1",
							"*:data-[slot=label]:col-start-2 *:data-[slot=label]:row-start-1",
							"*:[[slot=description]]:col-start-2 *:[[slot=description]]:row-start-2",
							"has-[[slot=description]]:**:data-[slot=label]:text-base-label-md",
							props.slot !== "selection" && "gap-x-2 gap-y-1 *:data-[slot=indicator]:mt-0.5",
						)}
					>
						<span
							className={boxStyles({ ...renderProps, isSelected: isSelected || isIndeterminate })}
							data-slot="indicator"
						>
							{indicator}
						</span>
						{content}
					</div>
				);
			})}
		</RACCheckbox>
	);
}
