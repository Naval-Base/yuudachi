"use client";

import { GridList, GridListItem } from "@/components/ui/GridList";
import { cx } from "@/styles/cva";

export function GuildsGrid({ items }: { readonly items: any[] }) {
	return (
		<GridList items={items} layout="grid">
			{(item: any) => {
				const isIconAnimated = item.icon?.startsWith("a_");

				return (
					<GridListItem
						className={cx(
							"flex h-full max-w-64 min-w-64 place-content-between rounded-lg border border-base-neutral-200 p-4 outline-0 transition-colors disabled:bg-base-neutral-200 disabled:opacity-38 dark:border-base-neutral-500 dark:disabled:bg-base-neutral-700",
							"hover:bg-base-tangerine-100/38 dark:hover:bg-base-tangerine-900/38",
							"focus-visible:bg-base-tangerine-100/38 dark:focus-visible:bg-base-tangerine-900/38",
							"pressed:bg-base-tangerine-100 dark:pressed:bg-base-tangerine-900",
							"data-[selected='true']:bg-base-tangerine-100/38 data-[selected='true']:hover:bg-base-tangerine-100/72 data-[selected='true']:focus-visible:bg-base-tangerine-100/72 dark:data-[selected='true']:bg-base-tangerine-900/38 dark:data-[selected='true']:hover:bg-base-tangerine-900/72 dark:data-[selected='true']:focus-visible:bg-base-tangerine-900/72 data-[selected='true']:pressed:bg-base-tangerine-100 dark:data-[selected='true']:pressed:bg-base-tangerine-900",
							"selected:bg-base-tangerine-100/38 selected:hover:bg-base-tangerine-100/72 selected:focus-visible:bg-base-tangerine-100/72 dark:selected:bg-base-tangerine-900/38 dark:selected:hover:bg-base-tangerine-900/72 dark:selected:focus-visible:bg-base-tangerine-900/72 selected:pressed:bg-base-tangerine-100 dark:selected:pressed:bg-base-tangerine-900",
						)}
						href={`/moderation/guilds/${item.id}`}
						id={item.id}
						textValue={item.name}
					>
						<span className="line-clamp-1 h-fit" title={item.name}>
							{item.name}
						</span>
						<picture className="shrink-0">
							<img
								alt={item.name}
								height={48}
								src={`https://cdn.discordapp.com/icons/${item.id}/${item.icon}${isIconAnimated ? ".gif" : ".png"}?size=480`}
								width={48}
							/>
						</picture>
					</GridListItem>
				);
			}}
		</GridList>
	);
}
