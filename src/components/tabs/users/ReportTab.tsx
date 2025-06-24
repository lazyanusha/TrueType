import { useState, useEffect } from "react";
import { FileTextIcon } from "lucide-react";

type Report = {
  id: number;
  title: string;
  date: string;
};

const REPORTS_PER_PAGE = 5;

const ReportsTab = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      const res = await fetch(
        `http://localhost:8000/reports`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await res.json();

      const formattedReports = data.reports.map((r: any) => ({
        id: r.id,
        title: r.filename || `Report #${r.id}`,
        date: new Date(r.created_at).toLocaleDateString(),
      }));

      setReports(formattedReports);

      // Calculate total pages from total_count
      setTotalPages(Math.ceil(data.total_count / REPORTS_PER_PAGE));
      setPage(pageNum);
    } catch (e: any) {
      setError(e.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, []);

  const handlePrev = () => {
    if (page > 1) fetchReports(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) fetchReports(page + 1);
  };

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
            {reports.map((r) => (
              <li
                key={r.id}
                className="border border-gray-300 rounded px-4 py-3 hover:shadow-md cursor-pointer"
                onClick={() => alert(`Open report ID: ${r.id}`)}
              >
                <p className="font-medium">{r.title}</p>
                <span className="text-sm text-gray-500">{r.date}</span>
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
    </div>
  );
};

export default ReportsTab;
