"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Team } from "@/types/team";
import { User } from "@/types/users";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

const TeamSwitcher = ({ user, teams }: { user: User; teams: Team[] }) => {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);

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
					<p className="truncate text-sm">{"Personal"}</p>
					<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandList>
						<CommandInput placeholder="Search team..." />
						<CommandEmpty>No team found.</CommandEmpty>
						<CommandGroup heading="Teams">
							{teams.map(({ id, name }) => (
								<CommandItem
									key={id}
									onSelect={() => {}}
									className="text-sm"
								>
									{name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default TeamSwitcher;
