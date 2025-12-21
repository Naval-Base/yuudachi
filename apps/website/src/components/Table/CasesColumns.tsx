"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "@/components/ui/Link";

const columnHelper = createColumnHelper<any>();

export const columns = [
	columnHelper.accessor("target_id", {
		header: "Target id",
		cell: (info) => <Link href={`/moderation/cases/${info.getValue()}`}>{info.getValue()}</Link>,
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
