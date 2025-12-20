import { HomeIcon } from "lucide-react";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import { Link } from "@/components/ui/Link";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarInset,
	SidebarItem,
	SidebarLabel,
	SidebarNav,
	SidebarProvider,
	SidebarSection,
	SidebarSectionGroup,
	SidebarTrigger,
} from "@/components/ui/Sidebar";

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<SidebarProvider className="[--sidebar-width-dock:3.25rem] [--sidebar-width:17rem]" defaultOpen>
			<Sidebar intent="inset">
				<SidebarHeader>
					<Link className="flex place-items-center gap-3" href="/moderation" variant="unset">
						<Image alt="Yuudachi" className="drop-shadow-md" height={32} src="/yuudachi_logo.svg" width={32} />
						<SidebarLabel className="text-base-label-xl font-bold">Yuudachi</SidebarLabel>
					</Link>
				</SidebarHeader>
				<SidebarContent>
					<SidebarSectionGroup>
						<SidebarSection label="Overview">
							<SidebarItem href="/moderation" tooltip="Home">
								<HomeIcon data-slot="icon" />
								<SidebarLabel>Home</SidebarLabel>
							</SidebarItem>
						</SidebarSection>
					</SidebarSectionGroup>
				</SidebarContent>
			</Sidebar>
			<SidebarInset>
				{/* <SidebarNav>
					<SidebarTrigger />
				</SidebarNav> */}
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
