"use client";

import { CheckIcon, MenuIcon } from "lucide-react";
import type { ComponentProps } from "react";
import type { ListBoxItemProps as RACListBoxItemProps, ListBoxProps as RACListBoxProps } from "react-aria-components";
import { ListBoxItem as RACListBoxItem, ListBox as RACListBox, composeRenderProps } from "react-aria-components";
import { DropdownLabel, DropdownSection, dropdownItemStyles } from "@/components/ui/Dropdown";
import { cx } from "@/styles/cva";

export function ListBox<Type extends object>(props: RACListBoxProps<Type>) {
	return (
		<RACListBox
			{...props}
			className={composeRenderProps(props.className, (className) =>
				cx(
					'border-base-neutral-200 dark:border-base-neutral-600 shadow-base-sm grid max-h-96 w-full min-w-56 grid-cols-[auto_1fr] gap-x-1 overflow-y-auto overscroll-contain rounded-sm border p-2 outline-hidden [scrollbar-width:thin] *:[[role="group"]+[role=group]]:mt-4 *:[[role="group"]+[role=separator]]:mt-1',

					className,
				),
			)}
			data-slot="list-box"
		/>
	);
}

export type ListBoxItemProps<Type extends object> = RACListBoxItemProps<Type> & {
	readonly className?: string;
	readonly classNames?: {
		readonly selected?: string;
	};
};

export function ListBoxItem<Type extends object>(props: ListBoxItemProps<Type>) {
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
			data-slot="list-box-item"
			textValue={textValue!}
		>
			{(renderProps) => {
				const { allowsDragging, isSelected, isFocused, isDragging } = renderProps;

				return (
					<>
						{allowsDragging && (
							<MenuIcon
								className={cx("shrink-0 transition", isFocused && "", isDragging && "", isSelected && "")}
								size={16}
							/>
						)}
						{typeof props.children === "function" ? (
							props.children(renderProps)
						) : typeof props.children === "string" ? (
							<DropdownLabel>{props.children}</DropdownLabel>
						) : (
							props.children
						)}
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
				);
			}}
		</RACListBoxItem>
	);
}

export type ListBoxSectionProps = ComponentProps<typeof DropdownSection>;

export function ListBoxSection(props: ListBoxSectionProps) {
	return <DropdownSection {...props} className={cx(props.className, "gap-1")} />;
}

export {
	DropdownLabel as ListBoxItemLabel,
	DropdownDescription as ListBoxItemDescription,
} from "@/components/ui/Dropdown";
