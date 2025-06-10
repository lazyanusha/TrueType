// src/components/PlagiarismReports.tsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../utils/useAuth";

interface MatchedSentence {
  sentence: string;
  sourceTitle: string;
  matchType: "Exact" | "Partial";
}

interface Report {
  id: number;
  resource_id: number;
  user_id: number;
  created_at: string;
  plagiarism_percentage: number;
  matched_sentences: MatchedSentence[];
  citation_issues: Record<string, any>;
}

export default function PlagiarismReports() {
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSuccess, setFilterSuccess] = useState<
    "All" | "Passed" | "Failed"
  >("All");
  const [filterType, setFilterType] = useState<"All" | "Exact" | "Partial">(
    "All"
  );
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchData = async () => {
      setLoading(true);
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      try {
        const res = await fetch("http://localhost:8000/reports/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data: Report[] = await res.json();
        setRecords(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, user]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        String(r.id).includes(search) ||
        String(r.plagiarism_percentage).includes(search);

      const successStatus = r.plagiarism_percentage < 30 ? "Passed" : "Failed";
      const matchesSuccess =
        filterSuccess === "All" || successStatus === filterSuccess;
      const matchTypes = r.matched_sentences.map((s) => s.matchType);
      const matchesType =
        filterType === "All" || matchTypes.includes(filterType);

      return matchesSearch && matchesSuccess && matchesType;
    });
  }, [records, searchTerm, filterSuccess, filterType]);

  if (authLoading || loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Plagiarism Scan Reports</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          placeholder="Search by ID or similarity"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow border p-2 rounded"
        />
        <select
          value={filterSuccess}
          onChange={(e) => setFilterSuccess(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option>All</option>
          <option>Passed</option>
          <option>Failed</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option value="All">All</option>
          <option value="Exact">Exact Match</option>
          <option value="Partial">Partial</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Similarity %</th>
              <th>Status</th>
              <th>Matches</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No reports found.
                </td>
              </tr>
            )}
            {filtered.map((r) => {
              const success =
                r.plagiarism_percentage < 30 ? "Passed" : "Failed";
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{r.id}</td>
                  <td className="p-2 border">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    {r.plagiarism_percentage.toFixed(1)}%
                  </td>
                  <td
                    className={`p-2 border font-semibold ${
                      success === "Passed" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {success}
                  </td>
                  <td className="p-2 border">{r.matched_sentences.length}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => setSelectedReport(r)}
                      className="text-blue-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl mb-4">Report #{selectedReport.id}</h2>
            <p>
              <strong>Similarity:</strong>{" "}
              {selectedReport.plagiarism_percentage.toFixed(1)}%
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  selectedReport.plagiarism_percentage < 30
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {selectedReport.plagiarism_percentage < 30
                  ? "Passed"
                  : "Failed"}
              </span>
            </p>
            <hr className="my-4" />
            {selectedReport.matched_sentences.length === 0 ? (
              <p>No matched sentences found.</p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {selectedReport.matched_sentences.map((m, i) => (
                  <li key={i} className="border p-2 rounded">
                    <p>
                      <strong>Sentence:</strong> {m.sentence}
                    </p>
                    <p>
                      <strong>Source:</strong> {m.sourceTitle}
                    </p>
                    <p>
                      <strong>Match Type:</strong> {m.matchType}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
