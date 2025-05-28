export interface ResultData {
  submittedDocument: string;
  matchedSources: MatchedSource[];
  scanProperties: {
    sourcesFound: number;
    words: number;
    characters: number;
    citationStatus: "Proper" | "Partial" | "False" | "Poor" | "None";
  };
  total_exact_score: number;
  total_partial_score: number;
  unique_score: number;
  user_files: string[];
  exact_matches: string[];
  partial_matches: string[];
  plagiarism_files: string[];
  plagiarisedSnippets: string[];
  matched_pairs: MatchedPair[];
}

interface MatchedPair {
  doc1_sentence: string;
  doc2_sentence: string;
  similarity: number;
  type: 'exact' | 'partial';
  source_file: string;
}

