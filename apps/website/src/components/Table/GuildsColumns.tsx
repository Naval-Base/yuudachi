"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";

const columnHelper = createColumnHelper<any>();

export const columns = [
	columnHelper.accessor("icon", {
		header: "Icon",
		cell: (info) => {
			const icon = info.getValue();
			const isIconAnimated = icon?.startsWith("a_");

			return icon ? (
				<picture>
					<img
						alt="Icon"
						className="h-[120px] max-h-[120px] rounded-lg object-cover shadow-md"
						src={`https://cdn.discordapp.com/icons/${info.row.original.id}/${icon}${isIconAnimated ? ".gif" : ".png"}?size=480`}
					/>
				</picture>
			) : null;
		},
	}),
	columnHelper.accessor("id", {
		header: "Guild id",
		cell: (info) => (
			<Link className="text-blurple" href={`/moderation/guilds/${info.getValue()}`}>
				{info.getValue()}
			</Link>
		),
	}),
	columnHelper.accessor("name", {
		header: "Name",
		cell: (info) => info.getValue(),
	}),
];
