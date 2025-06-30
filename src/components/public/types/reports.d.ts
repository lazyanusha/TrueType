export interface ResultData {
  total_exact_score: number;
  total_partial_score: number;
  unique_score: number;
  exact_matches: string[];
  partial_matches: string[];
  matched_pairs: Array<[string, string]>; // adjust type if needed
  plagiarisedSnippets: string[];
  plagiarism_files: string[];
  submittedDocument: string;
  user_files: string[];
  citations_found: string[];
  document_citation_status: string;
}
