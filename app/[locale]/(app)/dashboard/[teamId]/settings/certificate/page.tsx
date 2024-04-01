"use client";

import { Certificate } from "@/components/Certificate";
import { Separator } from "@/components/ui/separator";
import { PDFViewer } from "@react-pdf/renderer";

const Page = () => {
	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h2>Certificate</h2>
					<p className="text-muted-foreground">
						View and manage how certificates are generated
					</p>
				</div>
			</div>
			<Separator className="my-8" />
			<PDFViewer className="h-[700px] w-full">
				<Certificate
					name="John Doe"
					course="Mathematics"
					completedAt={new Date()}
					teamName="Mentor Canada Institute"
				/>
			</PDFViewer>
		</>
	);
};

export default Page;
