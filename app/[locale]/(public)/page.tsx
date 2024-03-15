import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";

const Home = ({ params: { locale } }: { params: { locale: string } }) => {
	unstable_setRequestLocale(locale);

	const t = useTranslations("Home");

	return (
		<main className="mx-auto w-full max-w-screen-xl">
			<div className="flex w-full flex-col items-start justify-center p-10 sm:p-20">
				<h1 className="flex flex-col gap-3 text-5xl sm:mb-0 sm:text-7xl">
					{t("title.1")}
					<span className="whitespace-nowrap text-green-400">
						{t("title.2")}
					</span>
				</h1>
				<div className="mt-6 flex sm:mt-12">
					<p>{t("description")}</p>
				</div>
				<a
					href="/auth/google"
					className={buttonVariants({
						className: "mt-8 sm:mt-12",
					})}
				>
					Get Started
				</a>
			</div>
		</main>
	);
};

export default Home;
