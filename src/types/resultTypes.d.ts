export interface MatchedSource {
  url: string;
  title: string;
  snippet: string;
}

export interface ResultData {
  submittedDocument: string;
  matchedSources: MatchedSource[];
  scanProperties: {
    sourcesFound: number;
    words: number;
    characters: number;
    citationStatus: "Proper" | "Partial" | "False" | "Poor" | "None";
  };
  plagiarism: {
    percentage: number;
    exactMatch: number;
    partialMatch: number;
    unique: number;
  };
}
