export function UserDisplay({
	user,
	className,
}: {
	readonly className?: string;
	readonly user: {
		accent_color?: number | null;
		avatar?: string | null;
		banner?: string | null;
		id: string;
		username: string;
	};
}) {
	const isAvatarAnimated = user.avatar?.startsWith("a_");
	const isBannerAnimated = user.banner?.startsWith("a_");

	return (
		<div className={`flex w-[340px] max-w-[340px] flex-col ${className ?? ""}`}>
			<div className="relative">
				<div className="h-[120px] max-h-[120px]">
					{user.banner ? (
						<picture>
							<img
								alt="Banner"
								className="h-full w-full rounded-lg object-cover shadow-md"
								src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}${
									isBannerAnimated ? ".gif" : ".png"
								}?size=480`}
							/>
						</picture>
					) : user.accent_color ? (
						<div
							className="h-full w-full rounded-lg shadow-md"
							style={{ background: `#${user.accent_color.toString(16)}` }}
						/>
					) : (
						<div className="dark:bg-dark-900 bg-dark-600 flex h-full w-full place-content-center items-center rounded-lg shadow-md">
							<span className="text-light-600">Actually poor.</span>
						</div>
					)}
				</div>

				{user.avatar ? (
					<div className="absolute top-[76px] left-[22px] rounded-full border-4">
						<picture>
							<img
								alt="Avatar"
								className="h-[80px] w-[80px] rounded-full shadow-md"
								src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}${
									isAvatarAnimated ? ".gif" : ".png"
								}`}
							/>
						</picture>
					</div>
				) : (
					<div className="absolute top-[76px] left-[22px] rounded-full border-4">
						<picture>
							<img
								alt="Avatar"
								className="h-[80px] w-[80px] rounded-full shadow-md"
								src={`https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 6n}.png`}
							/>
						</picture>
					</div>
				)}
			</div>
			<div className="flex place-content-end truncate py-3 pr-[22px] pl-28">
				<span className="truncate font-medium">{user.username}</span>
			</div>
		</div>
	);
}
