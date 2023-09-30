export function UserDisplay({
	user,
}: {
	readonly user: { avatar: string; banner: string; id: string; username: string };
}) {
	const isAvatarAnimated = user.avatar.startsWith("a_");
	const isBannerAnimated = user.banner.startsWith("a_");

	return (
		<div className="flex w-[340px] flex-col p-5">
			<div className="relative">
				<picture>
					<img
						alt="Avatar"
						className="h-full max-h-[120px] w-full max-w-[340px] rounded-lg object-cover"
						src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}${
							isBannerAnimated ? ".gif" : ".png"
						}?size=480`}
					/>
				</picture>
				<picture>
					<img
						alt="Banner"
						className="border-3 absolute left-[22px] top-[72px] h-[80px] w-[80px] rounded-full"
						src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}${isAvatarAnimated ? ".gif" : ".png"}`}
					/>
				</picture>
			</div>
			<div className="flex place-content-end p-2">
				<span className="">{user.username}</span>
			</div>
		</div>
	);
}
