import Image from "next/future/image";

export default function IndexRoute() {
	return <Image className="mx-auto block p-16" src="/yuudachi_logo.svg" alt="Yuudachi" width={800} height={800} />;
}
