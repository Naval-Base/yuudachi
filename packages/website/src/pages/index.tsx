import Image from "next/future/image";

export default function IndexRoute() {
	return (
		<Image
			className="p-16 mx-auto bg-[#202225]"
			src="/yuudachi_logo.svg"
			alt="Yuudachi"
			width={250}
			height={250}
			style={{ height: "100%", width: "100%" }}
		/>
	);
}
