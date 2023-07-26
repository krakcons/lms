import Link from "next/link";

export default function Home() {
	return (
		<main className="bg-slate-900">
			<div className="flex flex-col items-center justify-center min-h-screen py-2">
				<h1 className="text-6xl font-bold text-white">Test packages</h1>
				<div className="flex mt-8">
					<Link href="/packages/1" className="bg-slate-700 px-8 py-4 rounded">
						Golf Course
					</Link>
				</div>
			</div>
		</main>
	);
}
