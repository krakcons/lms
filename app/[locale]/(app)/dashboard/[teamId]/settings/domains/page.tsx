import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env.mjs";
import { redirect } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { getAuth, getTeam } from "@/server/auth/actions";
import { resend } from "@/server/resend";
import { DomainResponse, DomainVerificationStatusProps } from "@/types/domain";
import { Team } from "@/types/team";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import DomainForm from "./DomainForm";

const InlineSnippet = ({
	className,
	children,
}: {
	className?: string;
	children: string;
}) => {
	return (
		<span className={cn("rounded border px-2 py-1", className)}>
			{children}
		</span>
	);
};

const DomainStatus = async ({ team }: { team: Team }) => {
	let status: DomainVerificationStatusProps = "Valid Configuration";

	const domainRes = await fetch(
		`https://api.vercel.com/v9/projects/${env.PROJECT_ID_VERCEL}/domains/${team.customDomain}?teamId=${env.TEAM_ID_VERCEL}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${env.AUTH_BEARER_TOKEN_VERCEL}`,
				"Content-Type": "application/json",
			},
		}
	);
	const domainJson = (await domainRes.json()) as DomainResponse & {
		error: { code: string; message: string };
	};

	const configRes = await fetch(
		`https://api.vercel.com/v6/domains/${team.customDomain}/config?teamId=${process.env.TEAM_ID_VERCEL}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${env.AUTH_BEARER_TOKEN_VERCEL}`,
				"Content-Type": "application/json",
			},
		}
	);
	const configJson = await configRes.json();

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

	const txtVerification =
		(status === "Pending Verification" &&
			domainJson.verification.find((x: any) => x.type === "TXT")) ||
		null;

	const recordType: "A" | "CNAME" = "A";

	if (status === "Valid Configuration") {
		return (
			<div>
				<Separator className="my-8" />
				<div className="mb-4 flex items-center space-x-2">
					<CheckCircle size={20} />
					<p className="text-lg font-semibold dark:text-white">
						{status}
					</p>
				</div>
				<p className="text-sm text-muted-foreground">
					Your domain is configured correctly!
				</p>
			</div>
		);
	}

	const subdomain =
		domainJson.name === domainJson.apexName
			? null
			: domainJson.name.slice(
					0,
					domainJson.name.length - domainJson.apexName.length - 1
				);

	return (
		<div>
			<Separator className="my-8" />
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
					<div className="flex items-center justify-between gap-6 rounded border p-3">
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
					<Tabs defaultValue={subdomain ? "cname" : "a"}>
						<TabsList>
							<TabsTrigger value="a">
								A Record{!subdomain && " (recommended)"}
							</TabsTrigger>
							<TabsTrigger value="cname">
								CNAME Record{subdomain && " (recommended)"}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="a">
							<div className="my-3 text-left">
								<p className="my-5 text-sm dark:text-white">
									To configure your apex domain (
									<InlineSnippet>
										{domainJson.apexName}
									</InlineSnippet>
									), set the following {recordType} record on
									your DNS provider to continue:
								</p>
								<div className="flex items-center justify-between gap-6 rounded border p-3">
									<div>
										<p className="text-sm font-bold">
											Type
										</p>
										<p className="mt-2 font-mono text-sm">
											{recordType}
										</p>
									</div>
									<div>
										<p className="text-sm font-bold">
											Name
										</p>
										<p className="mt-2 font-mono text-sm">
											@
										</p>
									</div>
									<div>
										<p className="text-sm font-bold">
											Value
										</p>
										<p className="mt-2 font-mono text-sm">
											76.76.21.21
										</p>
									</div>
									<div>
										<p className="text-sm font-bold">TTL</p>
										<p className="mt-2 font-mono text-sm">
											86400
										</p>
									</div>
								</div>
							</div>
						</TabsContent>
						<TabsContent value="cname">
							<div className="my-3 text-left">
								<p className="my-5 text-sm dark:text-white">
									To configure your subdomain (
									<InlineSnippet>
										{domainJson.name}
									</InlineSnippet>
									), set the following {recordType} record on
									your DNS provider to continue:
								</p>
								<div className="flex items-center justify-between gap-6 rounded border p-3">
									<div>
										<p className="text-sm font-bold">
											Type
										</p>
										<p className="mt-2 font-mono text-sm">
											CNAME
										</p>
									</div>
									<div>
										<p className="text-sm font-bold">
											Name
										</p>
										<p className="mt-2 font-mono text-sm">
											{subdomain ?? "www"}
										</p>
									</div>
									<div>
										<p className="text-sm font-bold">
											Value
										</p>
										<p className="mt-2 font-mono text-sm">
											cname.vercel-dns.com.
										</p>
									</div>
									<div>
										<p className="text-sm font-bold">TTL</p>
										<p className="mt-2 font-mono text-sm">
											86400
										</p>
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>
					<p className="mt-5 text-sm dark:text-white">
						Note: for TTL, if <InlineSnippet>86400</InlineSnippet>{" "}
						is not available, set the highest value possible. Also,
						domain propagation can take up to an hour.
					</p>
				</>
			)}
		</div>
	);
};

const EmailStatus = async ({ team }: { team: Team }) => {
	if (!team.resendDomainId) return null;

	const domainRes = await resend.domains.get(team.resendDomainId);

	console.log(domainRes);

	return (
		<>
			{domainRes.data?.records.map((record) => (
				<div
					key={record.name}
					className="flex items-center justify-between gap-6 rounded border p-3"
				>
					<div>
						<p className="text-sm font-bold">Type</p>
						<p className="mt-2 font-mono text-sm">{record.type}</p>
					</div>
					<div>
						<p className="text-sm font-bold">Name</p>
						<p className="mt-2 font-mono text-sm">{record.name}</p>
					</div>
					<div>
						<p className="text-sm font-bold">Value</p>
						<p className="mt-2 font-mono text-sm">{record.value}</p>
					</div>
				</div>
			))}
		</>
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
			{team.customDomain && <DomainStatus team={team} />}
			{team.resendDomainId && <EmailStatus team={team} />}
		</div>
	);
};

export default Page;
