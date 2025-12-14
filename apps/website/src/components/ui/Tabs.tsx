"use client";

import type {
	TabListProps as RACTabListProps,
	TabPanelProps as RACTabPanelProps,
	TabProps as RACTabProps,
	TabsProps as RACTabsProps,
} from "react-aria-components";
import {
	TabList as RACTabList,
	TabPanel as RACTabPanel,
	Tab as RACTab,
	Tabs as RACTabs,
	composeRenderProps,
	SelectionIndicator as RACSelectionIndicator,
} from "react-aria-components";
import { compose, cva, cx } from "@/styles/cva";
import { focusRing } from "@/styles/ui/focusRing";
import { composeTailwindRenderProps } from "@/styles/util";

const tabsStyles = cva({
	base: "group/tabs flex gap-4 forced-color-adjust-none",
	variants: {
		orientation: {
			horizontal: "flex-col",
			vertical: "w-full flex-row",
		},
	},
});

export function Tabs(props: RACTabsProps) {
	return (
		<RACTabs
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				tabsStyles({
					...renderProps,
					className,
				}),
			)}
		/>
	);
}

const tabListStyles = cva({
	base: "border-base-neutral-100 dark:border-base-neutral-700 relative flex forced-color-adjust-none",
	variants: {
		orientation: {
			horizontal:
				"min-h-16 w-full flex-row place-items-center gap-x-4 overflow-x-auto overflow-y-hidden border-b px-4 md:overflow-x-visible md:overflow-y-visible",
			vertical: "min-w-40 flex-col place-items-start gap-y-1 border-r pr-4",
		},
	},
});

export type TabListProps<Type extends object> = RACTabListProps<Type>;

export function TabList<Type extends object>(props: TabListProps<Type>) {
	return (
		<RACTabList
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				tabListStyles({ ...renderProps, className }),
			)}
			data-slot="tab-list"
		/>
	);
}

const tabStyles = compose(
	focusRing,
	cva({
		base: [
			"group/tab relative isolate flex cursor-default place-items-center gap-2 rounded-2xl px-3 py-1.5 whitespace-nowrap transition *:data-[slot=icon]:size-4",
			"group-orientation-vertical/tabs:w-full group-orientation-vertical/tabs:py-0 group-orientation-vertical/tabs:pr-2 group-orientation-vertical/tabs:pl-4",
			"text-base-neutral-800 dark:text-base-neutral-60",
			"hover:bg-base-neutral-200 dark:hover:bg-base-neutral-600",
			"focus-visible:bg-base-neutral-200 dark:focus-visible:bg-base-neutral-600",
			"pressed:bg-base-neutral-500 pressed:text-base-neutral-40 dark:pressed:bg-base-neutral-300 dark:pressed:text-base-neutral-900",
			"selected:bg-base-neutral-100 dark:selected:bg-base-neutral-700",
			"selected:hover:bg-base-neutral-200 dark:selected:hover:bg-base-neutral-600",
			"selected:focus-visible:bg-base-neutral-200 dark:selected:focus-visible:bg-base-neutral-600",
			"selected:pressed:bg-base-neutral-500 dark:selected:pressed:bg-base-neutral-300",
		],
		variants: {
			isDisabled: {
				true: "forced-colors:selected:bg-[GrayText] forced-colors:selected:text-[HighlightText] forced-colors:text-[GrayText]",
				false: null,
			},
		},
	}),
);

export type TabProps = RACTabProps & { readonly hasIndicator?: boolean };

export function Tab({ hasIndicator = true, ...props }: TabProps) {
	return (
		<RACTab
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				tabStyles({
					...renderProps,
					className: cx("href" in props && "cursor-pointer", className),
				}),
			)}
			data-slot="tab"
		>
			{(values) => (
				<>
					{typeof props.children === "function" ? props.children(values) : props.children}
					{hasIndicator && (
						<RACSelectionIndicator
							className={cx(
								"bg-base-neutral-800 dark:bg-base-neutral-60 absolute rounded transition-[translate,width,height] duration-200",
								"group-orientation-horizontal/tabs:inset-x-0 group-orientation-horizontal/tabs:-bottom-[15px] group-orientation-horizontal/tabs:h-0.5",
							)}
							data-slot="selected-indicator"
						/>
					)}
				</>
			)}
		</RACTab>
	);
}

export type TabPanelProps = RACTabPanelProps;

export function TabPanel(props: TabPanelProps) {
	return (
		<RACTabPanel
			{...props}
			className={composeTailwindRenderProps(props.className, "flex-1 focus-visible:outline-hidden")}
			data-slot="tab-panel"
		/>
	);
}
