import { useState, useEffect } from "react";
import { FileTextIcon, Trash2Icon } from "lucide-react";
import { authFetch } from "../../../utils/authfetch";

type MatchDetail = {
	sentence: string;
	sourceTitle: string;
};

type Report = {
	id: number;
	full_name?: string;
	filename: string;
	total_exact_score: number;
	total_partial_score: number;
	unique_score: number;
	submitted_document: string;
	document_citation_status: string | null;
	exact_matches: MatchDetail[];
	partial_matches: MatchDetail[];
	created_at: string;
	words?: number;
	characters?: number;
};

const REPORTS_PER_PAGE = 5;

// Helper function to get a "filename" preview from submitted document content
function getFileNameFromDocument(doc: string, wordLimit = 5): string {
	if (!doc) return "Untitled Report";
	const words = doc.trim().split(/\s+/);
	if (words.length <= wordLimit) {
		return words.join(" ");
	}
	return words.slice(0, wordLimit).join(" ") + "...";
}

const ReportsTab = () => {
	const [reports, setReports] = useState<Report[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedReport, setSelectedReport] = useState<Report | null>(null);
	const [selectedReportIndex, setSelectedReportIndex] = useState<number | null>(
		null
	);

	const token =
		localStorage.getItem("access_token") ||
		sessionStorage.getItem("access_token");

	const fetchReports = async (pageNum: number) => {
		try {
			setLoading(true);
			setError(null);
			const res = await fetch(
				`http://localhost:8000/reports/history?page=${pageNum}&limit=${REPORTS_PER_PAGE}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			if (!res.ok) throw new Error("Failed to fetch reports");

			const data = await res.json();
			const formattedReports = data.reports.map((r: any) => ({
				id: r.id,
				filename: getFileNameFromDocument(r.submitted_document),
				created_at: r.created_at,
				total_exact_score: r.total_exact_score,
				total_partial_score: r.total_partial_score,
				unique_score: r.unique_score,
				submitted_document: r.submitted_document,
				document_citation_status: r.citation_status,
				exact_matches: [],
				partial_matches: [],
				words: r.words,
				characters: r.characters,
			}));

			setReports(formattedReports);
			const totalCount = data.pagination?.total_count || 0;
			setTotalPages(Math.ceil(totalCount / REPORTS_PER_PAGE));
			setPage(pageNum);
		} catch (e: any) {
			setError(e.message);
			setReports([]);
		} finally {
			setLoading(false);
		}
	};

	const fetchFullReport = async (reportId: number, index: number) => {
		try {
			const res = await authFetch(
				`http://localhost:8000/reports/user/${reportId}`
			);
			if (!res.ok) throw new Error("Failed to fetch report details");
			const data = await res.json();
			setSelectedReport(data);
			setSelectedReportIndex(index);
		} catch (e: any) {
			alert("Error loading report: " + e.message);
		}
	};

	const deleteReport = async () => {
		if (!selectedReport) return;
		const confirm = window.confirm(
			"Are you sure you want to delete this report?"
		);
		if (!confirm) return;

		try {
			const res = await fetch(
				`http://localhost:8000/reports/user/${selectedReport.id}`,
				{ method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
			);
			if (!res.ok) throw new Error("Failed to delete report");
			alert("Report deleted successfully");
			setSelectedReport(null);
			setSelectedReportIndex(null);
			fetchReports(page);
		} catch (e: any) {
			alert("Delete failed: " + e.message);
		}
	};

	useEffect(() => {
		fetchReports(1);
	}, []);

	const handlePrev = () => page > 1 && fetchReports(page - 1);
	const handleNext = () => page < totalPages && fetchReports(page + 1);

	if (loading) return <p>Loading reports...</p>;

	if (error)
		return (
			<div className="text-red-600">
				<p>Error: {error}</p>
				<button
					className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
					onClick={() => fetchReports(page)}
				>
					Retry
				</button>
			</div>
		);

	return (
		<div className="mt-8">
			<h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
				<FileTextIcon className="w-5 h-5" /> Plagiarism Reports
			</h2>

			{reports.length === 0 ? (
				<p className="text-gray-500">No reports found.</p>
			) : (
				<>
					<ul className="space-y-3 mb-4">
						{reports.map((r, idx) => (
							<li
								key={r.id}
								className="border border-gray-300 rounded px-4 py-3 hover:shadow-md cursor-pointer"
								onClick={() => fetchFullReport(r.id, idx)}
							>
								<p className="font-medium">
									{(page - 1) * REPORTS_PER_PAGE + idx + 1}. {r.filename}
								</p>
								<span className="text-sm text-gray-500">
									{new Date(r.created_at).toLocaleDateString()}
								</span>
							</li>
						))}
					</ul>

					<div className="flex justify-between items-center">
						<button
							className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
							onClick={handlePrev}
							disabled={page === 1}
						>
							Previous
						</button>
						<span>
							Page {page} of {totalPages}
						</span>
						<button
							className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
							onClick={handleNext}
							disabled={page === totalPages}
						>
							Next
						</button>
					</div>
				</>
			)}

			{/* Modal */}
			{selectedReport && (
				<div
					className="fixed inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center z-50"
					onClick={() => {
						setSelectedReport(null);
						setSelectedReportIndex(null);
					}}
				>
					<div
						className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-lg relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							className="absolute top-4 right-4 text-2xl font-bold"
							onClick={() => {
								setSelectedReport(null);
								setSelectedReportIndex(null);
							}}
						>
							&times;
						</button>
						<h2 className="text-xl font-bold mb-4 py-2">
							Report #
							{selectedReportIndex !== null
								? (page - 1) * REPORTS_PER_PAGE + selectedReportIndex + 1
								: selectedReport.id}
						</h2>
						<p className="mb-2">
							<strong>Filename:</strong>{" "}
							{getFileNameFromDocument(selectedReport.submitted_document)}
						</p>
						<p className="mb-2">
							<strong>Checked On:</strong>{" "}
							{new Date(selectedReport.created_at).toLocaleString()}
						</p>
						<p className="mb-2">
							<strong>Words:</strong> {selectedReport.words || 0}
						</p>
						<p className="mb-2">
							<strong>Characters:</strong> {selectedReport.characters || 0}
						</p>
						<p className="mb-2">
							<strong>Similarity:</strong>{" "}
							{(
								selectedReport.total_exact_score +
								selectedReport.total_partial_score
							).toFixed(1)}
							%
						</p>
						<p className="mb-2">
							<strong>Exact Score:</strong>{" "}
							{selectedReport.total_exact_score.toFixed(1)}%
						</p>
						<p className="mb-2">
							<strong>Partial Score:</strong>{" "}
							{selectedReport.total_partial_score.toFixed(1)}%
						</p>
						<p className="mb-2">
							<strong>Unique Score:</strong>{" "}
							{selectedReport.unique_score.toFixed(1)}%
						</p>
						<p className="mb-4">
							<strong>Citation Status:</strong>{" "}
							{selectedReport.document_citation_status || "Uncited"}
						</p>

						<button
							className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
							onClick={deleteReport}
						>
							<Trash2Icon className="w-4 h-4" />
							Delete Report
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ReportsTab;
