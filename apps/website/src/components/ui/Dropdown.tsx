"use client";

import { CheckIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
	Collection as RACCollection,
	composeRenderProps,
	Header as RACHeader,
	ListBoxItem as RACListBoxItem,
	ListBoxSection as RACListBoxSection,
	Separator as RACSeparator,
	Text as RACText,
} from "react-aria-components";
import type {
	SectionProps as RACSectionProps,
	ListBoxItemProps as RACListBoxItemProps,
	TextProps as RACTextProps,
	SeparatorProps as RACSeparatorProps,
} from "react-aria-components";
import { Keyboard } from "@/components/ui/Keyboard";
import { cva, cx } from "@/styles/cva";

export type DropdownSectionProps<Type extends object> = RACSectionProps<Type> & {
	readonly title?: string;
};

export function DropdownSection<Type extends object>(props: DropdownSectionProps<Type>) {
	return (
		<RACListBoxSection {...props} className={cx("col-span-full grid grid-cols-[auto_1fr]", props.className)}>
			{props.title && (
				<RACHeader className="text-base-label-sm text-base-neutral-600 dark:text-base-neutral-300 col-span-full px-3 py-2">
					{props.title}
				</RACHeader>
			)}
			<RACCollection items={props.items!}>{props.children}</RACCollection>
		</RACListBoxSection>
	);
}

export function DropdownLabel(props: RACTextProps) {
	return <RACText {...props} className={cx("col-start-1 line-clamp-2", props.className)} slot="label" />;
}

export const dropdownItemStyles = cva({
	base: [
		"col-span-full grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] not-has-[[slot=description]]:items-center has-[[slot=description]]:**:data-[slot=check-indicator]:mt-[1.5px] supports-[grid-template-columns:subgrid]:grid-cols-subgrid",
		"group forced-color:text-[Highlight] text-base-md h-inherit relative cursor-default rounded-sm px-3 py-2.5 outline-0 forced-color-adjust-none select-none has-[[slot=description]]:h-[inherit] has-[[slot=description]]:place-content-center forced-colors:text-[LinkText]",
		"text-base-neutral-900 dark:text-base-neutral-40 bg-base-neutral-0 dark:bg-base-neutral-800",
		"hover:bg-base-neutral-80 dark:hover:bg-base-neutral-700/72",
		"focus-visible:bg-base-neutral-80 dark:focus-visible:bg-base-neutral-700/72",
		"pressed:bg-base-neutral-100 dark:pressed:bg-base-neutral-700/72",
		"data-destructive:text-base-sunset-600 dark:data-destructive:text-base-sunset-400 data-destructive:hover:bg-base-sunset-100 dark:data-destructive:hover:bg-base-sunset-800 data-destructive:hover:text-base-sunset-700 dark:data-destructive:hover:text-base-sunset-300 data-destructive:focus-visible:bg-base-sunset-100 dark:data-destructive:focus-visible:bg-base-sunset-800 data-destructive:focus-visible:hover:text-base-sunset-700 dark:data-destructive:focus-visible:text-base-sunset-300 data-destructive:pressed:bg-base-sunset-200 dark:data-destructive:pressed:bg-base-sunset-700 data-destructive:pressed:text-base-sunset-800 dark:data-destructive:pressed:text-base-sunset-100",
		"forced-colors:**:data-[slot=icon]:text-[CanvasText] forced-colors:group-data-focused:**:data-[slot=icon]:text-[Canvas]",
	],
	variants: {
		isFocused: {
			true: "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
			false: null,
		},
		isDisabled: {
			true: "opacity-50 forced-colors:text-[GrayText]",
		},
	},
});

export type DropdownItemProps = RACListBoxItemProps & {
	readonly classNames?: {
		readonly selected?: string;
	};
};

export function DropdownItem(props: DropdownItemProps) {
	const textValue = props.textValue ?? (typeof props.children === "string" ? props.children : undefined);

	return (
		<RACListBoxItem
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				dropdownItemStyles({
					...renderProps,
					className,
				}),
			)}
			textValue={textValue!}
		>
			{composeRenderProps(props.children, (children, { isSelected }) => (
				<>
					{typeof children === "string" ? <DropdownLabel>{children}</DropdownLabel> : children}
					{isSelected && (
						<div
							className={cx(
								"bg-base-tangerine-600 dark:bg-base-tangerine-400 col-start-2 row-start-1 flex size-[18px] shrink-0 place-content-center place-items-center place-self-end rounded-full",
								props.classNames?.selected,
							)}
							data-slot="check-indicator"
						>
							<CheckIcon aria-hidden className="text-base-neutral-40 dark:text-base-neutral-900" size={14} />
						</div>
					)}
				</>
			))}
		</RACListBoxItem>
	);
}

export function DropdownDescription(props: RACTextProps) {
	return (
		<RACText
			{...props}
			className={cx(
				"text-base-sm text-base-neutral-600 dark:text-base-neutral-300 col-start-1 line-clamp-2",
				props.className,
			)}
			slot={props.slot ?? "description"}
		/>
	);
}

export function DropdownSeparator(props: RACSeparatorProps) {
	return (
		<RACSeparator
			{...props}
			className={cx(
				"bg-base-neutral-100 dark:bg-base-neutral-700 col-span-full mx-3 my-2 h-px forced-colors:bg-[ButtonBorder]",
				props.className,
			)}
			orientation="horizontal"
		/>
	);
}

export function DropdownKeyboard(props: ComponentProps<typeof Keyboard>) {
	return <Keyboard {...props} className={cx("absolute right-2 pl-2", props.className)} />;
}
