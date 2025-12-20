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
						className="rounded-lg object-cover drop-shadow-md"
						height={48}
						src={`https://cdn.discordapp.com/icons/${info.row.original.id}/${icon}${isIconAnimated ? ".gif" : ".png"}?size=480`}
						width={48}
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
