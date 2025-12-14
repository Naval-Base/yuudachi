"use client";

import type { VariantProps } from "cva";
import type {
	DialogProps as RACDialogProps,
	DialogTriggerProps as RACDialogTriggerProps,
	ModalOverlayProps as RACModalOverlayProps,
} from "react-aria-components";
import {
	DialogTrigger as RACDialogTrigger,
	ModalOverlay as RACModalOverlay,
	Modal as RACModal,
	composeRenderProps,
} from "react-aria-components";
import { Dialog, DialogCloseIndicator } from "@/components/ui/Dialog";
import { cva } from "@/styles/cva";

export function Modal(props: RACDialogTriggerProps) {
	return <RACDialogTrigger {...props} />;
}

const modalOverlayStyles = cva({
	base: "bg-base-neutral-900/72 fixed inset-0 z-50 grid h-(--visual-viewport-height,100vh) grid-rows-[1fr_auto] place-items-center p-4 text-center sm:grid-rows-[1fr_auto_3fr]",
	variants: {
		isBlurred: {
			true: "supports-backdrop-filter:backdrop-blur-xs supports-backdrop-filter:backdrop-filter",
		},
		isEntering: {
			true: "fade-in animate-in duration-300 ease-out",
		},
		isExiting: {
			true: "fade-out animate-out duration-200 ease-in",
		},
	},
});

const modalContentStyles = cva({
	base: "bg-base-neutral-0 shadow-base-xl dark:bg-base-neutral-800 relative row-start-2 max-h-full w-full overflow-hidden rounded-lg text-left align-middle [--visual-viewport-vertical-padding:16px] sm:[--visual-viewport-vertical-padding:32px]",
	variants: {
		isEntering: {
			true: "fade-in slide-in-from-bottom animate-in sm:zoom-in-95 sm:slide-in-from-bottom-0 duration-200 ease-out",
		},
		size: {
			"2xs": "sm:max-w-2xs",
			xs: "sm:max-w-xs",
			sm: "sm:max-w-sm",
			md: "sm:max-w-md",
			lg: "sm:max-w-lg",
			xl: "sm:max-w-xl",
			"2xl": "sm:max-w-2xl",
			"3xl": "sm:max-w-3xl",
			"4xl": "sm:max-w-4xl",
			"5xl": "sm:max-w-5xl",
			fullscreen: "",
		},
	},
	defaultVariants: {
		size: "lg",
	},
});

export type ModalContentProps = Omit<RACModalOverlayProps, "children"> &
	Pick<RACDialogProps, "aria-label" | "aria-labelledby" | "children" | "role"> &
	VariantProps<typeof modalContentStyles> & {
		readonly closeButton?: boolean;
		readonly isBlurred?: boolean;
		readonly overlay?: Omit<RACModalOverlayProps, "children">;
	};

export function ModalContent({
	isDismissable: isDismissableInternal,
	isBlurred = false,
	role = "dialog",
	closeButton = true,
	overlay,
	...props
}: ModalContentProps) {
	const isDismissable = isDismissableInternal ?? role !== "alertdialog";

	return (
		<RACModalOverlay
			{...props}
			className={composeRenderProps(overlay?.className, (className, renderProps) =>
				modalOverlayStyles({
					...renderProps,
					isBlurred,
					className,
				}),
			)}
			data-slot="modal-overlay"
			isDismissable={isDismissable}
		>
			<RACModal
				{...props}
				className={composeRenderProps(props.className, (className, renderProps) =>
					modalContentStyles({
						...renderProps,
						size: props.size,
						className,
					}),
				)}
				data-slot="modal-content"
				isDismissable={isDismissable}
			>
				<Dialog role={role}>
					{(values) => (
						<>
							{typeof props.children === "function" ? props.children(values) : props.children}
							{closeButton && <DialogCloseIndicator isDismissable={isDismissable} />}
						</>
					)}
				</Dialog>
			</RACModal>
		</RACModalOverlay>
	);
}

export {
	DialogBody as ModalBody,
	DialogClose as ModalClose,
	DialogDescription as ModalDescription,
	DialogFooter as ModalFooter,
	DialogHeader as ModalHeader,
	DialogTitle as ModalTitle,
	DialogTrigger as ModalTrigger,
} from "@/components/ui/Dialog";
