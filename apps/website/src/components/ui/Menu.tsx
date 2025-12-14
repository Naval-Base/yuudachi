"use client";

import type { VariantProps } from "cva";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import type {
	MenuItemProps as RACMenuItemProps,
	MenuProps as RACMenuProps,
	MenuSectionProps as RACMenuSectionProps,
	MenuTriggerProps as RACMenuTriggerProps,
	SubmenuTriggerProps as RACSubmenuTriggerProps,
	ButtonProps as RACButtonProps,
} from "react-aria-components";
import {
	Collection as RACCollection,
	Header as RACHeader,
	MenuItem as RACMenuItem,
	Menu as RACMenu,
	MenuSection as RACMenuSection,
	MenuTrigger as RACMenuTrigger,
	SubmenuTrigger as RACSubmenuTrigger,
	composeRenderProps,
} from "react-aria-components";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { dropdownItemStyles } from "@/components/ui/Dropdown";
import { PopoverContent, type PopoverContentProps } from "@/components/ui/Popover";
import { cx } from "@/styles/cva";

export function Menu(props: RACMenuTriggerProps) {
	return <RACMenuTrigger {...props} />;
}

export function MenuSubMenu({ delay = 0, ...props }: RACSubmenuTriggerProps) {
	return (
		<RACSubmenuTrigger {...props} delay={delay}>
			{props.children}
		</RACSubmenuTrigger>
	);
}

type MenuTriggerProps = RACButtonProps;

export function MenuTrigger(props: MenuTriggerProps) {
	return <Button {...props} className={cx("relative", props.className)} data-slot="menu-trigger" />;
}

type MenuContentProps<Type> = Pick<PopoverContentProps, "placement"> &
	RACMenuProps<Type> & {
		readonly className?: string;
		readonly popover?: Pick<
			PopoverContentProps,
			| "arrowBoundaryOffset"
			| "className"
			| "crossOffset"
			| "isOpen"
			| "offset"
			| "onOpenChange"
			| "placement"
			| "shouldFlip"
			| "showArrow"
			| "triggerRef"
		>;
	};

export function MenuContent<Type extends object>({ popover, ...props }: MenuContentProps<Type>) {
	return (
		<PopoverContent {...popover} className={cx("min-w-(--trigger-width)", popover?.className)}>
			<RACMenu
				{...props}
				className={cx(
					'grid max-h-[inherit] grid-cols-[auto_1fr] gap-x-2 overflow-x-hidden overflow-y-auto overscroll-contain p-2 outline-hidden *:[[role="group"]+[role="group"]]:mt-2 *:[[role="group"]+[role="separator"]]:mt-1',
					props.className,
				)}
				data-slot="menu-content"
			/>
		</PopoverContent>
	);
}

export function StandaloneMenuContent<Type extends object>(props: RACMenuProps<Type>) {
	return (
		<RACMenu
			{...props}
			className={cx(
				'grid max-h-[inherit] grid-cols-[auto_1fr] gap-x-2 overflow-x-hidden overflow-y-auto overscroll-contain p-2 outline-hidden *:[[role="group"]+[role="group"]]:mt-2 *:[[role="group"]+[role="separator"]]:mt-1',
				props.className,
			)}
		/>
	);
}

type MenuItemProps = RACMenuItemProps &
	VariantProps<typeof dropdownItemStyles> & {
		readonly disallowSelection?: boolean;
		readonly isDestructive?: boolean;
	};

export function MenuItem({ isDestructive = false, ...props }: MenuItemProps) {
	const textValue = props.textValue ?? (typeof props.children === "string" ? props.children : undefined);

	return (
		<RACMenuItem
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				dropdownItemStyles({
					...renderProps,
					className: renderProps.hasSubmenu
						? cx("", className)
						: cx(
								renderProps.selectionMode === "multiple" &&
									"grid-cols-[auto_1fr] gap-2 supports-[grid-template-columns:subgrid]:grid-cols-[auto_1fr]",
								className,
							),
				}),
			)}
			data-destructive={isDestructive ? "true" : undefined}
			data-slot="menu-item"
			textValue={textValue!}
		>
			{(values) => (
				<>
					{values.selectionMode === "multiple" && !props.disallowSelection && (
						<Checkbox isSelected={values.isSelected} />
					)}

					{typeof props.children === "function" ? props.children(values) : props.children}

					{values.isSelected && (
						<>
							{values.selectionMode === "single" && (
								<div
									className="bg-base-tangerine-600 dark:bg-base-tangerine-400 flex size-[18px] place-content-center place-items-center place-self-end self-center rounded-full"
									data-slot="checked-icon"
								>
									<CheckIcon
										aria-hidden
										className="text-base-neutral-40 dark:text-base-neutral-900 size-3.5 shrink-0"
									/>
								</div>
							)}
						</>
					)}

					{values.hasSubmenu && (
						<ChevronRightIcon aria-hidden className="absolute right-2 size-3.5" data-slot="chevron" />
					)}
				</>
			)}
		</RACMenuItem>
	);
}

export type MenuHeaderProps = ComponentProps<typeof RACHeader> & {
	readonly separator?: boolean;
};

export function MenuHeader({ className, separator = false, ...props }: MenuHeaderProps) {
	return (
		<RACHeader
			{...props}
			className={cx(
				"text-base-label-sm col-span-full px-2.5 py-2",
				separator && "-mx-1 mb-1 border-b sm:px-3 sm:pb-2.5",
				className,
			)}
		/>
	);
}

type MenuSectionProps<Type> = RACMenuSectionProps<Type> & {
	readonly label?: string;
};

export function MenuSection<Type extends object>(props: MenuSectionProps<Type>) {
	return (
		<RACMenuSection {...props} className={cx("col-span-full grid grid-cols-[auto_1fr]", props.className)}>
			{props.label && <RACHeader className="text-base-label-sm col-span-full px-2.5 py-1">{props.label}</RACHeader>}
			<RACCollection items={props.items!}>{props.children}</RACCollection>
		</RACMenuSection>
	);
}

export {
	DropdownSeparator as MenuSeparator,
	DropdownDescription as MenuItemDescription,
	DropdownKeyboard as MenuItemKeyboard,
	DropdownLabel as MenuItemLabel,
} from "@/components/ui/Dropdown";
