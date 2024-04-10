"use client";

import { locales } from "@/i18n";
import { usePathname, useRouter } from "@/lib/navigation";
import { Language } from "@/types/translations";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

const LanguageToggle = () => {
	const locale = useLocale();
	const pathname = usePathname();
	const router = useRouter();
	const params = useSearchParams();

	return (
		<Select
			onValueChange={(value: Language) => {
				router.push(`/${pathname}?${params.toString()}`, {
					locale: value,
				});
			}}
			defaultValue={locale}
		>
			<SelectTrigger className="w-[80px]">
				<SelectValue placeholder="Language" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{locales.map((locale) => (
						<SelectItem key={locale} value={locale}>
							{locale}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

export default LanguageToggle;
