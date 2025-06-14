import { authFetch } from "../../utils/authfetch";
import type { ResultData } from "../publilc/types/reports";

async function saveReportToDB(resultData: ResultData) {
  try {
    const payload = {
      total_exact_score: resultData.total_exact_score,
      total_partial_score: resultData.total_partial_score,
      unique_score: resultData.unique_score,
      user_files: resultData.user_files || [],
      exact_matches: resultData.exact_matches || [],
      partial_matches: resultData.partial_matches || [],
      plagiarism_files: resultData.plagiarism_files || [],
      submitted_document: resultData.submittedDocument,
      plagiarised_snippets: resultData.plagiarisedSnippets || [],
      matched_pairs: resultData.matched_pairs || [],
      document_citation_status: resultData.document_citation_status || null,
      citations_found: resultData.citations_found || [],
    };

    const res = await authFetch("http://localhost:8000/reports/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.detail || "Failed to upload report");
    return data;
  } catch (error) {
    console.error("Error uploading report:", error);
    throw error;
  }
}

export default saveReportToDB;