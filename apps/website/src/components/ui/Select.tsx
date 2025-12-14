"use client";

import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { ListBoxProps as RACListBoxProps, SelectProps as RACSelectProps } from "react-aria-components";
import {
	Button as RACButton,
	Select as RACSelect,
	SelectValue as RACSelectValue,
	composeRenderProps,
} from "react-aria-components";
import type { Button } from "@/components/ui/Button";
import { ListBox } from "@/components/ui/ListBox";
import { PopoverContent, type PopoverContentProps } from "@/components/ui/Popover";
import { compose, cva, cx } from "@/styles/cva";
import { focusRing } from "@/styles/ui/focusRing";
import { composeTailwindRenderProps } from "@/styles/util";

export type SelectProps<Type extends object, Mode extends "multiple" | "single" = "single"> = RACSelectProps<
	Type,
	Mode
> & {
	readonly items?: Iterable<Type, Mode>;
};

export function Select<Type extends object, Mode extends "multiple" | "single" = "single">(
	props: SelectProps<Type, Mode>,
) {
	return (
		<RACSelect
			{...props}
			className={composeTailwindRenderProps(props.className, "group flex w-full flex-col gap-1")}
			data-slot="control"
		/>
	);
}

type SelectListProps<Type extends object> = Omit<RACListBoxProps<Type>, "layout" | "orientation"> & {
	readonly items?: Iterable<Type>;
	readonly popover?: Omit<PopoverContentProps, "children">;
};

export function SelectList<Type extends object>({ popover, ...props }: SelectListProps<Type>) {
	return (
		<PopoverContent
			{...popover}
			className={cx("min-w-(--trigger-width) scroll-py-1 overflow-y-auto overscroll-contain", popover?.className)}
			placement={popover?.placement ?? "bottom"}
		>
			<ListBox
				{...props}
				className={cx(
					"grid max-h-96 w-full grid-cols-[auto_1fr] flex-col gap-y-1 overflow-y-auto p-1 outline-hidden *:[[role='group']+[role=group]]:mt-4 *:[[role='group']+[role=separator]]:mt-1",
					props.className,
				)}
				items={props.items!}
				layout="stack"
				orientation="vertical"
			>
				{props.children}
			</ListBox>
		</PopoverContent>
	);
}

const selectTriggerStyles = compose(
	focusRing,
	cva({
		base: [
			"group/select-trigger relative flex h-10 w-full min-w-0 place-items-center overflow-hidden rounded-sm border px-3 py-2.5 text-start transition duration-200 ease-out forced-colors:outline-[Highlight]",
			"bg-base-neutral-0 border-base-neutral-300 dark:bg-base-neutral-800 dark:border-base-neutral-500",
			"hover:border-base-neutral-200 dark:hover:border-base-neutral-600",
			"focus-visible:border-base-neutral-200 dark:focus-visible:border-base-neutral-600",
			"group-open:border-base-neutral-200 dark:group-open:border-base-neutral-600 group-open:outline-2",
			"group-disabled:bg-base-neutral-100 group-disabled:border-base-neutral-100 dark:group-disabled:border-base-neutral-400 dark:group-disabled:bg-base-neutral-400 group-disabled:opacity-38 group-disabled:forced-colors:border group-disabled:forced-colors:border-[GrayText]",
			"group-invalid:border-base-sunset-500 forced-colors:group-invalid:border-[Mark]",
			"group-invalid:hover:border-base-sunset-200 dark:group-invalid:hover:border-base-sunset-700",
			"group-invalid:focus-visible:border-base-sunset-200 dark:group-invalid:focus-visible:border-base-sunset-700",
			"*:data-[slot=icon]:text-base-neutral-800 dark:*:data-[slot=icon]:text-base-neutral-100 *:data-[slot=icon]:size-6 **:data-[slot=icon]:size-6 **:data-[slot=icon]:shrink-0",
		],
	}),
);

export type SelectTriggerProps = ComponentProps<typeof Button> & {
	readonly className?: string;
	readonly prefix?: ReactNode;
};

export function SelectTrigger(props: SelectTriggerProps) {
	return (
		<span className="relative block w-full" data-slot="control">
			<RACButton
				className={composeRenderProps(props.className, (className, renderProps) =>
					selectTriggerStyles({
						...renderProps,
						className,
					}),
				)}
			>
				{(values) => (
					<>
						{props.prefix && <span className="mr-2 *:data-[slot=icon]:size-5.5">{props.prefix}</span>}
						{typeof props.children === "function" ? props.children(values) : props.children}

						{!props.children && (
							<>
								<RACSelectValue
									className="text-base-neutral-900 group-disabled:data-placeholder:text-base-neutral-900 dark:group-disabled:data-placeholder:text-base-neutral-40 dark:data-placeholder:text-base-neutral-500 dark:text-base-neutral-40 data-placeholder:text-base-neutral-400 text-base-lg sm:text-base-md truncate **:[[slot=description]]:hidden **:[[slot=label]]:inline"
									data-slot="select-value"
								/>
								<ChevronDownIcon
									aria-hidden
									className="ml-auto size-6 shrink-0 duration-200 group-open:rotate-180 forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
									data-slot="icon"
									size={24}
									strokeWidth={1.5}
								/>
							</>
						)}
					</>
				)}
			</RACButton>
		</span>
	);
}

export {
	DropdownSection as SelectSection,
	DropdownSeparator as SelectSeparator,
	DropdownLabel as SelectLabel,
	DropdownDescription as SelectOptionDescription,
	DropdownItem as SelectOption,
} from "@/components/ui/Dropdown";
