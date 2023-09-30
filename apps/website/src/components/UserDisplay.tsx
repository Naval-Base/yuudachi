export function UserDisplay({
	user,
}: {
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
		<div className="flex w-[340px] flex-col p-5">
			<div className="relative">
				<div className="h-[120px] max-h-[120px] w-[340px] max-w-[340px]">
					{user.banner ? (
						<picture>
							<img
								alt="Banner"
								className="h-full w-full rounded-lg object-cover"
								src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}${
									isBannerAnimated ? ".gif" : ".png"
								}?size=480`}
							/>
						</picture>
					) : user.accent_color ? (
						<div className="h-full w-full rounded-lg" style={{ background: `#${user.accent_color.toString(16)}` }} />
					) : (
						<div className="flex h-full w-full place-content-center items-center rounded-lg bg-black">
							<span>Actually poor.</span>
						</div>
					)}
				</div>

				{user.avatar ? (
					<picture>
						<img
							alt="Avatar"
							className="border-3 absolute left-[22px] top-[72px] h-[80px] w-[80px] rounded-full"
							src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}${isAvatarAnimated ? ".gif" : ".png"}`}
						/>
					</picture>
				) : (
					<picture>
						<img
							alt="Avatar"
							className="border-3 absolute left-[22px] top-[72px] h-[80px] w-[80px] rounded-full"
							src={`https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 6n}.png`}
						/>
					</picture>
				)}
			</div>
			<div className="flex place-content-end p-2">
				<span className="">{user.username}</span>
			</div>
		</div>
	);
}
