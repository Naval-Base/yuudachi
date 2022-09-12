import Image from "next/future/image";

export default function IndexRoute() {
	return (
		<Image
			src="/yuudachi_logo.svg"
			alt="Yuudachi"
			width={800}
			height={800}
			style={{ display: "block", margin: "0 auto", padding: "4rem" }}
		/>
	);
}
