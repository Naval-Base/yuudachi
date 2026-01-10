"use client";

import { ChevronDownIcon } from "lucide-react";
import { use } from "react";
import {
	Disclosure as RACDisclosure,
	DisclosureGroup as RACDisclosureGroup,
	Heading as RACHeading,
	Button as RACButton,
	composeRenderProps,
	DisclosurePanel as RACDisclosurePanel,
	DisclosureStateContext as RACDisclosureStateContext,
} from "react-aria-components";
import type {
	DisclosureProps as RACDisclosureProps,
	DisclosureGroupProps as RACDisclosureGroupProps,
	ButtonProps as RACButtonProps,
	DisclosurePanelProps as RACDisclosurePanelProps,
} from "react-aria-components";
import { compose, cva, cx } from "@/styles/cva";
import { focusRing } from "@/styles/ui/focusRing";
import { composeTailwindRenderProps } from "@/styles/util";

export function DisclosureGroup(props: RACDisclosureGroupProps) {
	return (
		<RACDisclosureGroup
			{...props}
			className={composeTailwindRenderProps(props.className, "flex flex-col gap-y-2")}
			data-slot="disclosure-group"
		/>
	);
}

const disclosureStyles = cva({
	base: "group/disclosure-item w-full min-w-60 duration-200",
	variants: {
		isDisabled: {
			true: "cursor-not-allowed opacity-38",
			false: null,
		},
	},
});

export function Disclosure(props: RACDisclosureProps) {
	return (
		<RACDisclosure
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				disclosureStyles({ ...renderProps, className }),
			)}
			data-slot="disclosure"
		/>
	);
}

const disclosureTriggerStyles = compose(
	focusRing,
	cva({
		base: "relative isolate flex w-full cursor-default place-content-between place-items-center text-left **:data-[slot='icon']:shrink-0 [&_[data-slot='icon']:not([class*='size-'])]:size-5",
		variants: {
			isOpen: {
				true: null,
				false: null,
			},
			isDisabled: {
				true: "forced-colors:text-[GrayText]",
				false: null,
			},
		},
	}),
);

export function DisclosureTrigger(props: RACButtonProps) {
	const state = use(RACDisclosureStateContext)!;

	return (
		<RACHeading>
			<RACButton
				{...props}
				className={composeRenderProps(props.className, (className, renderProps) =>
					disclosureTriggerStyles({ ...renderProps, className }),
				)}
				slot="trigger"
			>
				{(values) => (
					<>
						{typeof props.children === "function" ? props.children(values) : props.children}
						<ChevronDownIcon
							aria-hidden
							className={cx(
								"ml-auto size-4 shrink-0 transition duration-300",
								state.isExpanded ? "rotate-0" : "rotate-90",
							)}
							data-slot="disclosure-chevron"
						/>
					</>
				)}
			</RACButton>
		</RACHeading>
	);
}

export function DisclosurePanel(props: RACDisclosurePanelProps) {
	return (
		<RACDisclosurePanel
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"h-(--disclosure-panel-height) overflow-clip transition-[height] duration-200",
			)}
			data-slot="disclosure-panel"
		>
			<div className="place-content-start place-self-stretch pt-2 text-pretty" data-slot="disclosure-panel-content">
				{props.children}
			</div>
		</RACDisclosurePanel>
	);
}
