import { Separator } from "@/components/ui/separator";
import { env } from "@/env.mjs";
import { redirect } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { getTeam } from "@/server/actions/auth";
import { getAuth } from "@/server/actions/cached";
import { DomainVerificationStatusProps } from "@/types/domain";
import { Team } from "@/types/team";
import { AlertCircle, XCircle } from "lucide-react";
import DomainForm from "./DomainForm";

export const InlineSnippet = ({
	className,
	children,
}: {
	className?: string;
	children: string;
}) => {
	return (
		<span
			className={cn(
				"inline-block rounded-md bg-blue-100 px-1 py-0.5 font-mono text-blue-900 dark:bg-blue-900 dark:text-blue-100",
				className
			)}
		>
			{children}
		</span>
	);
};

const DomainStatus = async ({ team }: { team: Team }) => {
	let status: DomainVerificationStatusProps = "Valid Configuration";
	const res = await fetch(
		`https://api.vercel.com/v9/projects/${env.PROJECT_ID_VERCEL}/domains/${team.customDomain}?teamId=${env.TEAM_ID_VERCEL}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${env.AUTH_BEARER_TOKEN_VERCEL}`,
				"Content-Type": "application/json",
			},
		}
	);
	const domainJson = await res.json();

	const res2 = await fetch(
		`https://api.vercel.com/v6/domains/${team.customDomain}/config?teamId=${process.env.TEAM_ID_VERCEL}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${env.AUTH_BEARER_TOKEN_VERCEL}`,
				"Content-Type": "application/json",
			},
		}
	);
	const configJson = await res2.json();

	if (domainJson?.error?.code === "not_found") {
		// domain not found on Vercel project
		status = "Domain Not Found";

		// unknown error
	} else if (domainJson.error) {
		status = "Unknown Error";

		// if domain is not verified, we try to verify now
	} else if (!domainJson.verified) {
		status = "Pending Verification";
		const verificationRes = await fetch(
			`https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains/${team.customDomain}/verify?teamId=${process.env.TEAM_ID_VERCEL}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
					"Content-Type": "application/json",
				},
			}
		);
		const verificationJson = await verificationRes.json();

		// domain was just verified
		if (verificationJson && verificationJson.verified) {
			status = "Valid Configuration";
		}
	} else if (configJson.misconfigured) {
		status = "Invalid Configuration";
	} else {
		status = "Valid Configuration";
	}

	if (!status || status === "Valid Configuration" || !domainJson) return null;

	const txtVerification =
		(status === "Pending Verification" &&
			domainJson.verification.find((x: any) => x.type === "TXT")) ||
		null;

	const recordType: "A" | "CNAME" = "A";

	return (
		<div className="border-t border-stone-200 px-10 pb-5 pt-7 dark:border-stone-700">
			<div className="mb-4 flex items-center space-x-2">
				{status === "Pending Verification" ? (
					<AlertCircle
						fill="#FBBF24"
						stroke="currentColor"
						className="text-white dark:text-black"
					/>
				) : (
					<XCircle
						fill="#DC2626"
						stroke="currentColor"
						className="text-white dark:text-black"
					/>
				)}
				<p className="text-lg font-semibold dark:text-white">
					{status}
				</p>
			</div>
			{txtVerification ? (
				<>
					<p className="text-sm dark:text-white">
						Please set the following TXT record on{" "}
						<InlineSnippet>{domainJson.apexName}</InlineSnippet> to
						prove ownership of{" "}
						<InlineSnippet>{domainJson.name}</InlineSnippet>:
					</p>
					<div className="my-5 flex items-start justify-start space-x-10 rounded-md bg-stone-50 p-2 dark:bg-stone-800 dark:text-white">
						<div>
							<p className="text-sm font-bold">Type</p>
							<p className="mt-2 font-mono text-sm">
								{txtVerification.type}
							</p>
						</div>
						<div>
							<p className="text-sm font-bold">Name</p>
							<p className="mt-2 font-mono text-sm">
								{txtVerification.domain.slice(
									0,
									txtVerification.domain.length -
										domainJson.apexName.length -
										1
								)}
							</p>
						</div>
						<div>
							<p className="text-sm font-bold">Value</p>
							<p className="mt-2 font-mono text-sm">
								<span className="text-ellipsis">
									{txtVerification.value}
								</span>
							</p>
						</div>
					</div>
					<p className="text-sm dark:text-stone-400">
						Warning: if you are using this domain for another site,
						setting this TXT record will transfer domain ownership
						away from that site and break it. Please exercise
						caution when setting this record.
					</p>
				</>
			) : status === "Unknown Error" ? (
				<p className="mb-5 text-sm dark:text-white">
					{domainJson.error.message}
				</p>
			) : (
				<>
					<div className="flex justify-start space-x-4">
						<button
							type="button"
							// onClick={() => setRecordType("A")}
							className={`${
								recordType == "A"
									? "border-black text-black dark:border-white dark:text-white"
									: "border-white text-stone-400 dark:border-black dark:text-stone-600"
							} ease border-b-2 pb-1 text-sm transition-all duration-150`}
						>
							A Record (recommended)
						</button>
						<button
							type="button"
							// onClick={() => setRecordType("CNAME")}
							className={`${
								// @ts-expect-error
								recordType == "CNAME"
									? "border-black text-black dark:border-white dark:text-white"
									: "border-white text-stone-400 dark:border-black dark:text-stone-600"
							} ease border-b-2 pb-1 text-sm transition-all duration-150`}
						>
							CNAME Record (recommended)
						</button>
					</div>
					<div className="my-3 text-left">
						<p className="my-5 text-sm dark:text-white">
							To configure your{" "}
							{recordType === "A" ? "apex domain" : "subdomain"} (
							<InlineSnippet>
								{recordType === "A"
									? domainJson.apexName
									: domainJson.name}
							</InlineSnippet>
							), set the following {recordType} record on your DNS
							provider to continue:
						</p>
						<div className="flex items-center justify-start space-x-10 rounded-md bg-stone-50 p-2 dark:bg-stone-800 dark:text-white">
							<div>
								<p className="text-sm font-bold">Type</p>
								<p className="mt-2 font-mono text-sm">
									{recordType}
								</p>
							</div>
							<div>
								<p className="text-sm font-bold">Name</p>
								<p className="mt-2 font-mono text-sm">
									{recordType === "A" ? "@" : "www"}
								</p>
							</div>
							<div>
								<p className="text-sm font-bold">Value</p>
								<p className="mt-2 font-mono text-sm">
									{recordType === "A"
										? `76.76.21.21`
										: `cname.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
								</p>
							</div>
							<div>
								<p className="text-sm font-bold">TTL</p>
								<p className="mt-2 font-mono text-sm">86400</p>
							</div>
						</div>
						<p className="mt-5 text-sm dark:text-white">
							Note: for TTL, if{" "}
							<InlineSnippet>86400</InlineSnippet> is not
							available, set the highest value possible. Also,
							domain propagation can take up to an hour.
						</p>
					</div>
				</>
			)}
		</div>
	);
};

const Page = async ({ params: { teamId } }: { params: { teamId: string } }) => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const team = await getTeam(teamId, user.id);

	if (!team) {
		return redirect("/404");
	}

	return (
		<div>
			<div className="flex items-center justify-between">
				<div>
					<h2>Domains</h2>
					<p className="text-muted-foreground">
						Set a custom domain for your course content
					</p>
				</div>
			</div>
			<Separator className="my-8" />
			<DomainForm team={team} />
			<DomainStatus team={team} />
		</div>
	);
};

export default Page;
