import type { ResultData } from "../components/publilc/types/resultTypes";

export async function checkPlagiarism(file: File): Promise<ResultData> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    // Return detailed error
    const errorText = await response.text();
    throw new Error(`Failed to check plagiarism: ${response.status} - ${errorText}`);
  }

  let resultData: any;
  try {
    resultData = await response.json();
  } catch (err) {
    throw new Error("Failed to parse API response as JSON");
  }

  // Defensive defaults for critical keys to avoid runtime errors
  if (!resultData || typeof resultData !== "object") {
    throw new Error("Invalid API response format");
  }

  // Ensure required fields exist with defaults
  const defaultResult: ResultData = {
    submittedDocument: resultData.submittedDocument || "",
    matched_pairs: Array.isArray(resultData.matched_pairs) ? resultData.matched_pairs : [],
    matchedSources: Array.isArray(resultData.matchedSources) ? resultData.matchedSources : [],
    total_exact_score: typeof resultData.total_exact_score === 'number' ? resultData.total_exact_score : 0,
    total_partial_score: typeof resultData.total_partial_score === 'number' ? resultData.total_partial_score : 0,
    unique_score: typeof resultData.unique_score === 'number' ? resultData.unique_score : 100,
    user_files: Array.isArray(resultData.user_files) ? resultData.user_files : [],
    exact_matches: Array.isArray(resultData.exact_matches) ? resultData.exact_matches : [],
    partial_matches: Array.isArray(resultData.partial_matches) ? resultData.partial_matches : [],
    plagiarism_files: Array.isArray(resultData.plagiarism_files) ? resultData.plagiarism_files : [],
    plagiarisedSnippets: Array.isArray(resultData.plagiarisedSnippets) ? resultData.plagiarisedSnippets : [],
    scanProperties: {
      citationStatus: resultData.scanProperties?.citationStatus || "None",
      words: typeof resultData.scanProperties?.words === 'number' ? resultData.scanProperties.words : 0,
      characters: typeof resultData.scanProperties?.characters === 'number' ? resultData.scanProperties.characters : 0,
      sourcesFound: typeof resultData.scanProperties?.sourcesFound === 'number' ? resultData.scanProperties.sourcesFound : 0,
    }
  };

  return defaultResult;
}