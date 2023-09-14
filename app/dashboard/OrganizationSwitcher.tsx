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
import {
	useClerk,
	useOrganization,
	useOrganizationList,
	useUser,
} from "@clerk/nextjs";
import { ChevronsUpDown, PlusCircle } from "lucide-react";

const TeamSwitcher = () => {
	const [open, setOpen] = React.useState(false);
	const { user } = useUser();
	const { openCreateOrganization, openOrganizationProfile } = useClerk();
	const { organization } = useOrganization();
	const { userMemberships, setActive } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});

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
							src={organization?.imageUrl ?? user?.imageUrl}
							alt={`${organization?.name} icon` ?? "User icon"}
						/>
						<AvatarFallback>
							{user?.firstName ? user.firstName[0] : "U"}
						</AvatarFallback>
					</Avatar>
					<p className="truncate">
						{organization?.name ?? user?.fullName ?? "Personal"}
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
								onSelect={() => {
									if (setActive) {
										setActive({
											organization: null,
										});
									}
									setOpen(false);
								}}
								className="text-sm"
							>
								<Avatar className="mr-2 h-5 w-5">
									<AvatarImage
										src={user?.imageUrl}
										alt="User icon"
										className="grayscale"
									/>
									<AvatarFallback>
										{user?.firstName
											? user.firstName[0]
											: "U"}
									</AvatarFallback>
								</Avatar>
								{user?.fullName ?? "Personal"}
							</CommandItem>
						</CommandGroup>
						<CommandGroup heading="Teams">
							{userMemberships.data?.map(({ organization }) => (
								<CommandItem
									key={organization.id}
									onSelect={() => {
										if (setActive)
											setActive({
												organization: organization.id,
											});
										setOpen(false);
									}}
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
									openCreateOrganization();
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
