"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";

const columnHelper = createColumnHelper<any>();

export const columns = [
	columnHelper.accessor("target_id", {
		header: "Target id",
		cell: (info) => (
			<Link href={`/moderation/cases/${info.getValue()}`} className="text-blurple">
				{info.getValue()}
			</Link>
		),
	}),
	columnHelper.accessor("target_tag", {
		header: "Username",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("cases_count", {
		header: "Cases",
		cell: (info) => info.getValue(),
	}),
];
