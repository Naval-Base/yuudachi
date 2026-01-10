"use client";

import type { ReactNode } from "react";
import { composeRenderProps, Radio as RACRadio, RadioGroup as RACRadioGroup } from "react-aria-components";
import type { RadioGroupProps as RACRadioGroupProps, RadioProps as RACRadioProps } from "react-aria-components";
import { Description, Label } from "@/components/ui/Field";
import { compose, cva, cx } from "@/styles/cva";
import { focusRing } from "@/styles/ui/focusRing";
import { composeTailwindRenderProps } from "@/styles/util";

export type RadioGroupProps = RACRadioGroupProps & {
	readonly classNames?: {
		readonly content?: string;
	};
	readonly description?: string;
	readonly label?: ReactNode | string;
};

export function RadioGroup(props: RadioGroupProps) {
	return (
		<RACRadioGroup
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"space-y-2 has-[[slot=description]]:space-y-2 **:[[slot=description]]:block",
			)}
			data-slot="control"
		/>
	);
}

const radioStyles = compose(
	focusRing,
	cva({
		base: "flex shrink-0 place-content-center place-items-center transition",
		variants: {
			variant: {
				unset: null,
				default: [
					"size-4 rounded-full border-[1.5px]",
					"border-base-neutral-300 bg-base-neutral-0",
					"group-hover:border-base-neutral-200",
					"group-focus-visible:border-base-neutral-200",
					"group-pressed:border-base-neutral-100",
					"group-disabled:border-transparent group-disabled:bg-base-neutral-200",
					"group-invalid:border-base-sunset-500",
					"group-invalid:group-hover:border-base-sunset-200 dark:group-invalid:group-hover:border-base-sunset-700",
					"group-invalid:group-focus-visible:border-base-sunset-200 dark:group-invalid:group-focus-visible:border-base-sunset-700",
					"group-invalid:group-pressed:border-base-sunset-100 dark:group-invalid:group-pressed:border-base-sunset-800",
				],
			},
			isSelected: {
				true: [
					"border-base-neutral-700 *:data-[slot=indicator]:bg-base-neutral-700",
					"group-hover:border-base-neutral-500 group-hover:*:data-[slot=indicator]:bg-base-neutral-500",
					"group-focus-visible:border-base-neutral-500 group-focus-visible:*:data-[slot=indicator]:bg-base-neutral-500",
					"group-pressed:border-base-neutral-400 group-pressed:*:data-[slot=indicator]:bg-base-neutral-400",
					"group-disabled:border-transparent group-disabled:bg-base-neutral-200 group-disabled:*:data-[slot=indicator]:bg-base-neutral-900",
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

export type RadioProps = RACRadioProps & {
	readonly classNames?: {
		readonly indicator?: string;
	};
	readonly description?: string;
	readonly label?: string;
	readonly showIndicator?: boolean;
};

export function Radio({ showIndicator = true, ...props }: RadioProps) {
	return (
		<RACRadio {...props} className={composeTailwindRenderProps(props.className, "group block disabled:opacity-50")}>
			{composeRenderProps(props.children, (children, renderProps) => {
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
						{props.label && <Label>{props.label}</Label>}
						{props.description && <Description>{props.description}</Description>}
					</>
				);

				return (
					<div
						className={cx(
							"grid grid-cols-[1rem_1fr] gap-x-2 gap-y-1",
							"*:data-[slot=indicator]:col-start-1 *:data-[slot=indicator]:row-start-1 *:data-[slot=indicator]:mt-0.75 sm:*:data-[slot=indicator]:mt-1",
							"*:data-[slot=label]:col-start-2 *:data-[slot=label]:row-start-1",
							"*:[[slot=description]]:col-start-2 *:[[slot=description]]:row-start-2",
							"has-[[slot=description]]:**:data-[slot=label]:font-medium",
						)}
					>
						<span
							className={radioStyles({
								...renderProps,
								className: "description" in props ? "mt-1" : "mt-0.5",
							})}
							data-slot="indicator"
						/>
						{content}
					</div>
				);
			})}
		</RACRadio>
	);
}
