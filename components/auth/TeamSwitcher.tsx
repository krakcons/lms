"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useClerkAppearance } from "@/lib/clerk";
import {
	useClerk,
	useOrganization,
	useOrganizationList,
	useUser,
} from "@clerk/nextjs";
import { ChevronsUpDown, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const useTeam = () => {
	const { organization } = useOrganization();
	const { user } = useUser();

	if (organization)
		return {
			team: {
				name: organization.name,
				type: "team",
				imageUrl: organization.imageUrl,
			},
		};
	else if (user)
		return {
			team: {
				name: user.fullName,
				type: "personal",
				imageUrl: user.imageUrl,
			},
		};
	else return { team: null };
};

const TeamSwitcher = () => {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const { user } = useUser();
	const { team } = useTeam();
	const { openCreateOrganization } = useClerk();
	const appearance = useClerkAppearance();
	const { userMemberships, setActive } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});

	const changeOrganization = async (organizationId: string | null) => {
		if (setActive) {
			setActive({
				beforeEmit: () => router.push("/dashboard"),
				organization: organizationId,
			});
		}
		setOpen(false);
	};

	if (!team || !user) return null;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-label="Select a team"
					className="w-[200px] justify-between"
				>
					<Avatar className="mr-2 h-6 w-6">
						<AvatarImage
							src={team.imageUrl}
							alt={`${team.name} icon` ?? "User icon"}
						/>
						<AvatarFallback>
							{team.name ? team.name[0] : "T"}
						</AvatarFallback>
					</Avatar>
					<p className="truncate">
						{team.type === "team" ? team.name : "Personal"}
					</p>
					<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandList>
						<CommandInput placeholder="Search team..." />
						<CommandEmpty>No team found.</CommandEmpty>
						<CommandGroup heading="Personal">
							<CommandItem
								onSelect={() => changeOrganization(null)}
								className="text-sm"
							>
								<Avatar className="mr-2 h-5 w-5">
									<AvatarImage
										src={user.imageUrl}
										alt="User icon"
										className="grayscale"
									/>
									<AvatarFallback>
										{user.firstName
											? user.firstName[0]
											: "U"}
									</AvatarFallback>
								</Avatar>
								{user.fullName ?? "Personal"}
							</CommandItem>
						</CommandGroup>
						<CommandGroup heading="Teams">
							{userMemberships.data?.map(({ organization }) => (
								<CommandItem
									key={organization.id}
									onSelect={() =>
										changeOrganization(organization.id)
									}
									className="text-sm"
								>
									<Avatar className="mr-2 h-5 w-5">
										<AvatarImage
											src={organization.imageUrl}
											alt={`${organization.name} icon`}
											className="grayscale"
										/>
										<AvatarFallback>
											{organization.name[0]}
										</AvatarFallback>
									</Avatar>
									{organization.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
					<CommandSeparator />
					<CommandList>
						<CommandGroup>
							<CommandItem
								onSelect={() => {
									openCreateOrganization({
										afterCreateOrganizationUrl:
											"/dashboard",
										appearance,
									});
									setOpen(false);
								}}
							>
								<PlusCircle className="mr-2 h-5 w-5" />
								Create Team
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default TeamSwitcher;
