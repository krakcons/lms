import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import { redirect } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { getAuth, getTeam } from "@/server/auth/actions";
import { resend } from "@/server/resend";
import { DomainResponse, DomainVerificationStatusProps } from "@/types/domain";
import { Team } from "@/types/team";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import DomainForm from "./DomainForm";

import { DNSRow } from "./DNSRow";

const Status = ({
	status,
	type,
}: {
	status: string;
	type: "good" | "not_done" | "error";
}) => {
	const icon = {
		good: <CheckCircle size={20} />,
		not_done: <AlertCircle size={20} />,
		error: <XCircle size={20} />,
	};

	return (
		<div className="flex items-center space-x-2">
			{icon[type]}
			<p className="text-lg font-semibold dark:text-white">{status}</p>
		</div>
	);
};

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
			<>
				<h4>Domain</h4>
				<Status status="Domain Verified" type="good" />
				<p className="text-sm text-muted-foreground">
					Your domain is configured correctly!
				</p>
			</>
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
		<>
			<h4>Domain</h4>
			<Status
				status={status}
				type={status === "Pending Verification" ? "not_done" : "error"}
			/>
			{txtVerification ? (
				<>
					<p className="text-sm dark:text-white">
						Please set the following TXT record on{" "}
						<InlineSnippet>{domainJson.apexName}</InlineSnippet> to
						prove ownership of{" "}
						<InlineSnippet>{domainJson.name}</InlineSnippet>:
					</p>
					<DNSRow
						type={txtVerification.type}
						name={txtVerification.domain.slice(
							0,
							txtVerification.domain.length -
								domainJson.apexName.length -
								1
						)}
						value={txtVerification.value}
						ttl="Auto"
					/>
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
								<DNSRow
									type={recordType}
									name="@"
									value="76.76.21.21"
									ttl="86400"
								/>
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
								<DNSRow
									type="CNAME"
									name={subdomain ?? "www"}
									value="cname.vercel-dns.com."
									ttl="86400"
								/>
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
		</>
	);
};

const EmailStatus = async ({ team }: { team: Team }) => {
	if (!team.resendDomainId) return null;

	const domainRes = await resend.domains.get(team.resendDomainId);
	const verify = await resend.domains.verify(team.resendDomainId);

	const statusMapping = {
		verified: {
			status: "Email Verified",
			type: "good",
		},
		failed: {
			status: "Email Verification Failed",
			type: "error",
		},
		pending: {
			status: "Email Verification Pending",
			type: "not_done",
		},
		temporary_failure: {
			status: "Temporary Failure",
			type: "error",
		},
		not_started: {
			status: "Not Started",
			type: "not_done",
		},
	};

	if (domainRes.data?.status === "verified") {
		return (
			<>
				<h4>Email</h4>
				<Status
					status={statusMapping[domainRes.data!.status].status}
					type={statusMapping[domainRes.data!.status].type as any}
				/>
				<p className="text-sm text-muted-foreground">
					Your email is configured correctly! All emails now contain
					the {'"from"'} and {'"reply-to"'} address of noreply@
					{team.customDomain}
				</p>
			</>
		);
	}

	return (
		<>
			<h4>Email</h4>
			<p className="text-sm text-muted-foreground">
				Will fallback to lcds.krakconsultants.com until email is
				verified.
			</p>
			{domainRes.error ? (
				<Status status="Error" type="error" />
			) : (
				<Status
					status={statusMapping[domainRes.data!.status].status}
					type={statusMapping[domainRes.data!.status].type as any}
				/>
			)}
			{domainRes.data?.records.map((record) => (
				<DNSRow
					key={record.name}
					{...record}
					priority={record.priority ?? 1}
				/>
			))}
		</>
	);
};

const Page = async ({ params }: { params: Promise<{ teamId: string }> }) => {
	const { teamId } = await params;
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const team = await getTeam(teamId, user.id);

	if (!team) {
		return redirect("/404");
	}

	console.log(team);

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
			{team.customDomain && (
				<div className="flex flex-col gap-4">
					<Separator className="my-8" />
					<h3>DNS Configuration</h3>
					<DomainStatus team={team} />
					{team.resendDomainId && <EmailStatus team={team} />}
				</div>
			)}
		</div>
	);
};

export default Page;
