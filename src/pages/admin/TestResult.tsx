import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../utils/useAuth";

interface MatchDetail {
	sentence: string;
	sourceTitle: string;
}

interface Report {
	id: number;
	full_name: string;
	filename: string;
	total_exact_score: number;
	total_partial_score: number;
	unique_score: number;
	exact_matches: MatchDetail[];
	partial_matches: MatchDetail[];
	submitted_document: string;
	document_citation_status: string | null;
	created_at: string;
}

const REPORTS_PER_PAGE = 20;

export default function PlagiarismReports() {
	const { user, loading: authLoading } = useAuth();
	const [records, setRecords] = useState<Report[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<
		"All" | "Plagiarized" | "Non-Plagiarized"
	>("All");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [, setLoading] = useState(true);
	const [, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			const token =
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token");

			try {
				const res = await fetch(
					`http://localhost:8000/reports/all?page=${page}&limit=${REPORTS_PER_PAGE}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				if (!res.ok) throw new Error("Failed to fetch reports");

				const data = await res.json();
				setRecords(data.reports);
				const totalCount = data.pagination?.total_count || 0;
				setTotalPages(Math.ceil(totalCount / REPORTS_PER_PAGE));
			} catch (e: any) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		};

		if (!authLoading && user) fetchData();
	}, [authLoading, user, page]);

	const getFilenameFromContent = (report: Report) => {
		if (report.filename && report.filename.trim() !== "") {
			return report.filename;
		}
		if (report.submitted_document && report.submitted_document.trim() !== "") {
			const snippet = report.submitted_document.trim().slice(0, 30);
			return snippet.length < report.submitted_document.length
				? snippet + "..."
				: snippet;
		}
		return "Untitled";
	};

	const similarityColor = (sim: number) => {
		if (sim > 80) return "text-red-600 font-bold";
		if (sim > 50) return "text-yellow-600 font-semibold";
		return "text-green-700";
	};

	const filtered = useMemo(() => {
		return records.filter((r) => {
			const search = searchTerm.toLowerCase();
			const similarity =
				Number(r.total_exact_score) + Number(r.total_partial_score);
			const plagiarized = similarity >= 20;

			const matchesSearch =
				String(r.id).includes(search) ||
				similarity.toFixed(1).includes(search) ||
				r.filename?.toLowerCase().includes(search) ||
				String(r.full_name).toLowerCase().includes(search);

			const matchesType =
				filterType === "All" ||
				(filterType === "Plagiarized" && plagiarized) ||
				(filterType === "Non-Plagiarized" && !plagiarized);

			const createdDate = new Date(r.created_at);
			const start = startDate ? new Date(startDate) : null;
			const end = endDate ? new Date(endDate) : null;

			const matchesDate =
				(!start || createdDate >= start) && (!end || createdDate <= end);

			return matchesSearch && matchesType && matchesDate;
		});
	}, [records, searchTerm, filterType, startDate, endDate]);

	return (
		<div className="">
			<h1 className="text-3xl font-bold mb-6 text-[#3C5773]">
				All Plagiarism Reports
			</h1>

			{/* Filters */}
			<div className="flex flex-wrap gap-4 mb-6">
				<input
					placeholder="Search by ID, user name, filename, similarity"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="flex-grow border border-gray-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3C5773]"
				/>
				<input
					type="date"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className="p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3C5773]"
				/>
				<input
					type="date"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					className="p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3C5773]"
				/>
				<select
					value={filterType}
					onChange={(e) => setFilterType(e.target.value as any)}
					className="p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3C5773]"
				>
					<option value="All">All</option>
					<option value="Plagiarized">Plagiarized</option>
					<option value="Non-Plagiarized">Non-Plagiarized</option>
				</select>
			</div>

			{/* Table */}
			<div className="overflow-x-auto border border-gray-300 rounded shadow-sm">
				<table className="w-full table-auto text-sm border-collapse">
					<thead className="bg-[#E6EAF2] text-[#3C5773]">
						<tr>
							<th className="p-3 border-b border-gray-300 text-left">S.No.</th>
							<th className="p-3 border-b border-gray-300 text-left">User</th>
							<th className="p-3 border-b border-gray-300 text-left">
								Filename
							</th>
							<th className="p-3 border-b border-gray-300 text-left">Date</th>
							<th className="p-3 border-b border-gray-300 text-left">
								Similarity
							</th>
							<th className="p-3 border-b border-gray-300 text-left">Exact</th>
							<th className="p-3 border-b border-gray-300 text-left">
								Partial
							</th>
							<th className="p-3 border-b border-gray-300 text-left">Unique</th>
							<th className="p-3 border-b border-gray-300 text-left">
								Plagiarized?
							</th>
							<th className="p-3 border-b border-gray-300 text-left">
								Citation Status
							</th>
						</tr>
					</thead>
					<tbody>
						{filtered.length === 0 ? (
							<tr>
								<td colSpan={10} className="text-center p-6 text-gray-500">
									No reports found.
								</td>
							</tr>
						) : (
							filtered.map((r, idx) => {
								const similarity = r.total_exact_score + r.total_partial_score;
								const plagiarized = similarity >= 20;

								return (
									<tr
										key={r.id}
										className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
									>
										<td className="p-3 border-b border-gray-300">
											{(page - 1) * REPORTS_PER_PAGE + idx + 1}
										</td>
										<td className="p-3 border-b border-gray-300">
											{r.full_name}
										</td>
										<td className="p-3 border-b border-gray-300">
											{getFilenameFromContent(r)}
										</td>
										<td className="p-3 border-b border-gray-300">
											{new Date(r.created_at).toLocaleString()}
										</td>
										<td
											className={`p-3 border-b border-gray-300 ${similarityColor(
												similarity
											)}`}
										>
											{similarity.toFixed(1)}%
										</td>
										<td className="p-3 border-b border-gray-300">
											{r.total_exact_score.toFixed(1)}%
										</td>
										<td className="p-3 border-b border-gray-300">
											{r.total_partial_score.toFixed(1)}%
										</td>
										<td className="p-3 border-b border-gray-300">
											{r.unique_score.toFixed(1)}%
										</td>
										<td
											className={`p-3 border-b border-gray-300 font-semibold ${
												plagiarized ? "text-red-600" : "text-green-700"
											}`}
										>
											{plagiarized ? "Yes" : "No"}
										</td>
										<td className="p-3 border-b border-gray-300">
											{r.document_citation_status || "Uncited"}
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="mt-6 flex justify-between items-center">
				<button
					className="px-4 py-2 bg-[#3C5773] text-white rounded disabled:opacity-50"
					disabled={page <= 1}
					onClick={() => setPage((p) => Math.max(1, p - 1))}
				>
					Previous
				</button>
				<span className="text-[#3C5773] font-semibold">
					Page {page} of {totalPages}
				</span>
				<button
					className="px-4 py-2 bg-[#3C5773] text-white rounded disabled:opacity-50"
					disabled={page >= totalPages}
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
				>
					Next
				</button>
			</div>
		</div>
	);
}
