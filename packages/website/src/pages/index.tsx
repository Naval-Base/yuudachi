import Image from "next/future/image";

export default function IndexRoute() {
	return (
		<Image
			// eslint-disable-next-line react/forbid-component-props
			className="p-16 mx-auto bg-[#202225]"
			src="/yuudachi_logo.svg"
			alt="Yuudachi"
			width={250}
			height={250}
			// eslint-disable-next-line react/forbid-component-props
			style={{ height: "100%", width: "100%" }}
		/>
	);
}
