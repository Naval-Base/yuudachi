"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";

const columnHelper = createColumnHelper<any>();

export const columns = [
	columnHelper.accessor("target_id", {
		header: "Target id",
		cell: (info) => (
			<Link className="text-blurple" href={`/moderation/cases/${info.getValue()}`}>
				{info.getValue()}
			</Link>
		),
	}),
	columnHelper.accessor("target_tag", {
		header: "Username",
		cell: (info) => info.getValue(),
	}),
];
