"use client";

import { ChevronDownIcon, MenuIcon } from "lucide-react";
import { createContext, use } from "react";
import type {
	CellProps as RACCellProps,
	ColumnProps as RACColumnProps,
	ColumnResizerProps as RACColumnResizerProps,
	TableHeaderProps as RACTableHeaderProps,
	RowProps as RACRowProps,
	TableBodyProps as RACTableBodyProps,
	TableProps as RACTableProps,
} from "react-aria-components";
import {
	Cell as RACCell,
	Collection as RACCollection,
	Column as RACColumn,
	ColumnResizer as RACColumnResizer,
	ResizableTableContainer as RACResizableTableContainer,
	Row as RACRow,
	TableBody as RACTableBody,
	TableHeader as RACTableHeader,
	Table as RACTable,
	useTableOptions,
} from "react-aria-components";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { cva, cx } from "@/styles/cva";
import { composeTailwindRenderProps } from "@/styles/util";

export type TableProps = RACTableProps & {
	readonly allowResize?: boolean;
	readonly className?: string;
};

const TableContext = createContext<TableProps>({
	allowResize: false,
});

export function useTableContext() {
	return use(TableContext);
}

export function Table(props: TableProps) {
	return (
		<TableContext.Provider value={props}>
			<div className="relative w-full overflow-auto **:data-[slot=table-resizable-container]:overflow-auto">
				{props.allowResize ? (
					<RACResizableTableContainer>
						<RACTable
							{...props}
							className={cx(
								"**:drop-target:border-primary text-base-md **:drop-target:border table w-full min-w-full caption-bottom border-spacing-0 outline-hidden",
								props.className,
							)}
						>
							{props.children}
						</RACTable>
					</RACResizableTableContainer>
				) : (
					<RACTable
						{...props}
						className={cx(
							"**:drop-target:border-primary text-base-md **:drop-target:border table w-full min-w-full caption-bottom border-spacing-0 outline-hidden",
							props.className,
						)}
					>
						{props.children}
					</RACTable>
				)}
			</div>
		</TableContext.Provider>
	);
}

function ColumnResizer(props: RACColumnResizerProps) {
	return (
		<RACColumnResizer
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"&[data-resizable-direction=left]:cursor-e-resize &[data-resizable-direction=right]:cursor-w-resize [&[data-resizing]>div]:bg-primary resizable-both:cursor-ew-resize absolute top-0 right-0 bottom-0 grid w-px touch-none place-content-center px-1",
			)}
		>
			<div className="bg-border h-full w-px py-3" />
		</RACColumnResizer>
	);
}

export function TableBody<Type extends object>(props: RACTableBodyProps<Type>) {
	return (
		<RACTableBody
			{...props}
			className={composeTailwindRenderProps(props.className, "[&_.tr:last-child]:border-0")}
			data-slot="table-body"
		/>
	);
}

export type TableCellProps = RACCellProps & {
	readonly className?: string;
};

const cellStyles = cva({
	base: "group relative h-16 px-4 py-3 whitespace-nowrap outline-hidden",
	variants: {
		allowResize: {
			true: "truncate overflow-hidden",
		},
	},
});

export function TableCell(props: TableCellProps) {
	const { allowResize } = useTableContext();

	return (
		<RACCell
			{...props}
			className={composeTailwindRenderProps(props.className, cellStyles({ allowResize }))}
			data-slot="table-cell"
		>
			{props.children}
		</RACCell>
	);
}

const columnStyles = cva({
	base: "allows-sorting:cursor-pointer dragging:cursor-grabbing relative h-16 px-4 py-3 text-left whitespace-nowrap [&:has([slot=selection])]:pr-0",
	variants: {
		isResizable: {
			true: "truncate overflow-hidden",
		},
	},
});

export type TableColumnProps = RACColumnProps & {
	readonly className?: string;
	readonly isResizable?: boolean;
};

export function TableColumn({ isResizable = false, ...props }: TableColumnProps) {
	return (
		<RACColumn
			{...props}
			className={composeTailwindRenderProps(props.className, columnStyles({ isResizable }))}
			data-slot="table-column"
		>
			{(values) => (
				<div className="flex place-items-center gap-2 **:data-[slot=icon]:shrink-0">
					{typeof props.children === "function" ? props.children(values) : props.children}
					{values.allowsSorting && (
						<span
							className={cx(
								"grid size-[1.15rem] flex-none shrink-0 place-content-center *:data-[slot=icon]:size-3.5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:transition-transform *:data-[slot=icon]:duration-200",
								values.isHovered ? "bg-base-tangerine-100/36" : "",
								props.className,
							)}
						>
							<ChevronDownIcon className={values.sortDirection === "ascending" ? "rotate-180" : ""} />
						</span>
					)}
					{isResizable && <ColumnResizer />}
				</div>
			)}
		</RACColumn>
	);
}

export type TableHeaderProps<Type extends object> = RACTableHeaderProps<Type> & {
	readonly className?: string;
};

export function TableHeader<Type extends object>(props: TableHeaderProps<Type>) {
	const { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();

	return (
		<RACTableHeader
			{...props}
			className={composeTailwindRenderProps(props.className, "border-b")}
			data-slot="table-header"
		>
			{allowsDragging && <RACColumn className="w-0" />}
			{selectionBehavior === "toggle" && (
				<RACColumn className="w-0 pl-4">{selectionMode === "multiple" && <Checkbox slot="selection" />}</RACColumn>
			)}
			<RACCollection items={props.columns!}>{props.children}</RACCollection>
		</RACTableHeader>
	);
}

export type TableRowProps<Type extends object> = RACRowProps<Type> & {
	readonly className?: string;
};

export function TableRow<Type extends object>(props: TableRowProps<Type>) {
	const { selectionMode, selectionBehavior, allowsDragging } = useTableOptions();

	return (
		<RACRow
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				cx(
					[
						"tr group outline-base-tangerine-400 dark:outline-base-tangerine-600 relative cursor-default border-b -outline-offset-2 focus-visible:outline-2 forced-colors:outline-[Highlight]",
						"bg-base-neutral-0 border-base-neutral-100 dark:bg-base-neutral-800 dark:border-base-neutral-700",
						"selected:bg-base-tangerine-100/36 dark:selected:bg-base-tangerine-900/38",
					],
					"href" in props
						? [
								"cursor-pointer",
								"[&:hover]:bg-base-tangerine-100/36 dark:[&:hover]:bg-base-tangerine-900/36",
								"pressed:bg-base-tangerine-100! dark:pressed:bg-base-tangerine-900!",
								"selected:[&:hover]:bg-base-tangerine-100/72! dark:selected:[&:hover]:bg-base-tangerine-900/72!",
								"selected:focus-visible:bg-base-tangerine-100/72! dark:selected:focus-visible:bg-base-tangerine-900/72!",
							]
						: ["[&:hover]:bg-base-neutral-60/38 dark:[&:hover]:bg-base-neutral-700/38"],
				),
			)}
			data-slot="table-row"
			href={selectionMode === "multiple" || selectionMode === "single" ? "" : props.href!}
			id={props.id!}
		>
			{allowsDragging && (
				<RACCell className="group dragging:cursor-grabbing cursor-grab pr-0">
					<Button slot="drag">
						<MenuIcon />
					</Button>
				</RACCell>
			)}
			{selectionBehavior === "toggle" && (
				<RACCell className="pl-4">
					<Checkbox slot="selection" />
				</RACCell>
			)}
			<RACCollection items={props.columns!}>{props.children}</RACCollection>
		</RACRow>
	);
}
