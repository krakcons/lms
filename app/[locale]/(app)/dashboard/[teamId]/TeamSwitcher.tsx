"use client";

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
import { translate } from "@/lib/translation";
import { Team, TeamTranslation } from "@/types/team";
import { Language } from "@/types/translations";
import { User } from "@/types/users";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TeamSwitcher = ({
	user,
	teams,
	teamId,
	locale,
}: {
	user: User;
	teams: (Team & {
		translations: TeamTranslation[];
	})[];
	teamId: string;
	locale: Language;
}) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		document.cookie = `teamId=${teamId}; path=/; secure;`;
	}, [teamId]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-label="Select a team"
					className="w-48 justify-between"
				>
					<p className="truncate text-sm">
						{
							translate(
								teams.find(({ id }) => id === teamId)
									?.translations!,
								locale
							)?.name
						}
					</p>
					<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-48 p-0">
				<Command>
					<CommandList>
						<CommandInput placeholder="Search team..." />
						<CommandEmpty>No team found.</CommandEmpty>
						<CommandGroup heading="Teams">
							{teams.map(({ id, translations }) => (
								<CommandItem
									key={id}
									onSelect={() => {
										router.push(`/dashboard/${id}`);
									}}
									className="text-sm"
								>
									{translate(translations, locale).name}
								</CommandItem>
							))}
						</CommandGroup>
						<CommandItem
							onSelect={() => {
								router.push("/dashboard/create");
							}}
							className="gap-2"
						>
							<Plus size={18} /> Create new team
						</CommandItem>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default TeamSwitcher;
