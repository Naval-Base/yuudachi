"use client";

import { XIcon } from "lucide-react";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";
import type { HeadingProps as RACHeadingProps } from "react-aria-components";
import { Dialog as RACDialog, Heading as RACHeading, Text as RACText } from "react-aria-components";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { cx } from "@/styles/cva";

export function Dialog({ role = "dialog", ...props }: ComponentProps<typeof RACDialog>) {
	return (
		<RACDialog
			{...props}
			className={cx(
				"peer/dialog group/dialog relative flex max-h-[calc(var(--visual-viewport-height)-var(--visual-viewport-vertical-padding))] flex-col overflow-hidden outline-hidden [scrollbar-width:thin]",
				props.className,
			)}
			data-slot="dialog"
			role={role}
		/>
	);
}

export type DialogHeaderProps = Omit<ComponentPropsWithoutRef<"div">, "title"> & {
	readonly description?: string;
	readonly hasBorder?: boolean;
	readonly title?: string;
};

export function DialogHeader({ hasBorder = false, ...props }: DialogHeaderProps) {
	return (
		<div
			className={cx(
				"relative flex flex-col gap-1 p-6 pb-4",
				hasBorder &&
					"border-b border-base-neutral-100 dark:border-base-neutral-700 [&[data-slot=dialog-header]:has(+[data-slot=dialog-footer])]:border-0",
				props.className,
			)}
			data-slot="dialog-header"
		>
			{props.title && <DialogTitle>{props.title}</DialogTitle>}
			{props.description && <DialogDescription>{props.description}</DialogDescription>}
			{!props.title && typeof props.children === "string" ? (
				<DialogTitle>{props.children}</DialogTitle>
			) : (
				props.children
			)}
		</div>
	);
}

export type DialogTitleProps = RACHeadingProps;

export function DialogTitle({ level = 2, ...props }: DialogTitleProps) {
	return (
		<RACHeading
			{...props}
			className={cx("flex flex-1 place-items-center text-base-label-md text-balance", props.className)}
			level={level}
			slot="title"
		/>
	);
}

export type DialogDescriptionProps = ComponentProps<"div">;

export function DialogDescription(props: DialogDescriptionProps) {
	return <RACText {...props} className={cx("text-sm text-pretty", props.className)} slot="description" />;
}

export type DialogBodyProps = ComponentProps<"div">;

export function DialogBody(props: DialogBodyProps) {
	return (
		<div
			{...props}
			className={cx("isolate flex min-h-0 flex-1 flex-col overflow-auto px-6 py-1", props.className)}
			data-slot="dialog-body"
		/>
	);
}

export type DialogFooterProps = ComponentProps<"div"> & {
	readonly hasBorder?: boolean;
};

export function DialogFooter({ hasBorder = false, ...props }: DialogFooterProps) {
	return (
		<div
			{...props}
			className={cx(
				"isolate mt-auto flex flex-col-reverse place-content-between gap-3 p-6 sm:flex-row sm:place-content-end sm:place-items-center",
				hasBorder && "border-t border-base-neutral-100 dark:border-base-neutral-700",
				props.className,
			)}
			data-slot="dialog-footer"
		/>
	);
}

export type DialogCloseProps = ButtonProps;

export function DialogClose(props: DialogCloseProps) {
	return <Button {...props} slot="close" />;
}

export type CloseButtonIndicatorProps = Omit<ButtonProps, "children"> & {
	readonly className?: string;
	readonly isDismissable?: boolean | undefined;
};

export function DialogCloseIndicator(props: CloseButtonIndicatorProps) {
	return props.isDismissable ? (
		<Button
			{...props}
			aria-label="Close"
			className={cx(
				"close absolute top-3 right-4 z-50 grid place-content-center rounded-full text-base-neutral-500 hover:text-base-neutral-700 focus-visible:text-base-neutral-700 disabled:text-base-neutral-300 dark:text-base-neutral-400 dark:hover:text-base-neutral-200 dark:focus-visible:text-base-neutral-200 dark:disabled:text-base-neutral-300 pressed:text-base-neutral-900 dark:pressed:text-base-neutral-500",
				props.className,
			)}
			size="icon-xs"
			slot="close"
			variant="unset"
		>
			<XIcon aria-hidden size={18} strokeWidth={1.5} />
		</Button>
	) : null;
}

export { Button as DialogTrigger } from "@/components/ui/Button";
