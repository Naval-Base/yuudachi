import Image from "next/image";

export default function Page() {
	return (
		<div className="flex min-h-dvh grow flex-col place-items-center">
			<Image alt="Yuudachi" className="p-32" height={800} src="/yuudachi_logo.svg" width={800} />
		</div>
	);
}
