"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@/components/ui/Table";

export function GuildsTable({ items }: { readonly items: any[] }) {
	return (
		<Table allowResize aria-label="Guilds">
			<TableHeader>
				<TableColumn maxWidth={100}>Icon</TableColumn>
				<TableColumn isRowHeader>Name</TableColumn>
			</TableHeader>
			<TableBody items={items}>
				{(item: any) => {
					const isIconAnimated = item.icon?.startsWith("a_");

					return (
						<TableRow href={`/moderation/guilds/${item.id}`} id={item.id}>
							<TableCell>
								<picture>
									<img
										alt={item.name}
										height={48}
										src={`https://cdn.discordapp.com/icons/${item.id}/${item.icon}${isIconAnimated ? ".gif" : ".png"}?size=480`}
										width={48}
									/>
								</picture>
							</TableCell>
							<TableCell>{item.name}</TableCell>
						</TableRow>
					);
				}}
			</TableBody>
		</Table>
	);
}
