"use client";

import { ChevronRightIcon } from "lucide-react";
import { createContext, use, useMemo } from "react";
import { Breadcrumbs as RACBreadcrumbs, Breadcrumb as RACBreadcrumb } from "react-aria-components";
import type {
	BreadcrumbsProps as RACBreadcrumbsProps,
	BreadcrumbProps as RACBreadcrumbProps,
	LinkProps as RACLinkProps,
} from "react-aria-components";
import { Link } from "@/components/ui/Link";
import { cx } from "@/styles/cva";
import { composeTailwindRenderProps } from "@/styles/util";

export type BreadcrumbsContextProps = {
	readonly separator?: boolean | "chevron" | "slash";
};

const BreadcrumbsProvider = createContext<BreadcrumbsContextProps>({
	separator: "chevron",
});

export function Breadcrumbs<Type extends object>(props: BreadcrumbsContextProps & RACBreadcrumbsProps<Type>) {
	const value = useMemo(() => ({ separator: props.separator! }), [props.separator]);

	return (
		<BreadcrumbsProvider value={value}>
			<RACBreadcrumbs {...props} className={cx("flex flex-wrap place-items-center gap-2", props.className)} />
		</BreadcrumbsProvider>
	);
}

export type BreadcrumbsItemProps = BreadcrumbsContextProps &
	RACBreadcrumbProps & {
		readonly href?: string | undefined;
	};

export function BreadcrumbItem(props: BreadcrumbsItemProps & Partial<Omit<RACLinkProps, "className">>) {
	const { separator: contextSeparator } = use(BreadcrumbsProvider);
	const separator = contextSeparator ?? props.separator;
	const separatorValue = separator === true ? "chevron" : separator;

	return (
		<RACBreadcrumb
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"text-base-xs text-base-neutral-600 dark:text-base-neutral-300 flex place-items-center gap-2",
			)}
		>
			{({ isCurrent }) => (
				<>
					{props.href ? <Link {...props} href={props.href} variant="breadcrumb" /> : props.children}
					{!isCurrent && separator !== false && <Separator separator={separatorValue} />}
				</>
			)}
		</RACBreadcrumb>
	);
}

export function Separator({ separator = "chevron" }: { readonly separator?: BreadcrumbsItemProps["separator"] }) {
	return (
		<span className="*:shrink-0 *:data-[slot=icon]:size-3.5">
			{separator === "chevron" && <ChevronRightIcon aria-hidden data-slot="icon" size={18} strokeWidth={1.5} />}
			{separator === "slash" && <span>/</span>}
		</span>
	);
}
