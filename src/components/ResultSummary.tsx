import React from "react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import type { MatchedPair, ResultData } from "../types/resultTypes";
import type { citationInfo } from "../constants/citationInfo";

interface Props {
  resultData: ResultData;
  animatedPercentage: number;
  elapsedTime: number;
  showResults: boolean;
  resultRef: React.RefObject<HTMLDivElement | null>;
  handleDownloadPDF: (
    id: string,
    options: { title: string; timestamp: string; duration: string }
  ) => void;
  citationInfo: Record<string, { label: string; description: string }>;
  getPathColor: (percentage: number) => string;
  getCitationStyles: (status: keyof typeof citationInfo) => string;
  // Removed wordCount and charCount from Props
}

const ResultSummary: React.FC<Props> = ({
  resultData,
  animatedPercentage,
  elapsedTime,
  resultRef,
  handleDownloadPDF,
  citationInfo,
  getPathColor,
  getCitationStyles,
}) => {
  const {
    total_exact_score,
    total_partial_score,
    unique_score,
    matched_pairs = [],
    submittedDocument = "",
  } = resultData;

  // Helper: Calculate word and character count from text (frontend only)
  const getWordAndCharacterCount = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const characters = text.length; // including spaces
    return { words, characters };
  };

  // Always compute word and character counts from submittedDocument
  const { words: finalWordCount, characters: finalCharCount } =
    getWordAndCharacterCount(submittedDocument);

  // Use frontend counts as fallback for scanProperties
  const scanProperties = {
    ...resultData.scanProperties,
    words: resultData.scanProperties?.words ?? finalWordCount,
    characters: resultData.scanProperties?.characters ?? finalCharCount,
    citationStatus: resultData.scanProperties?.citationStatus ?? "None",
    sourcesFound:
      resultData.scanProperties?.sourcesFound ??
      Array.from(new Set(matched_pairs.map((pair) => pair.source_file))).length,
  };

  const noPlagiarismFound =
    total_exact_score === 0 && total_partial_score === 0;
  const computedPercentage = 100 - total_exact_score - total_partial_score;

  // Highlight submitted content based on matched snippets
  const highlightSubmittedContent = React.useMemo(() => {
    const uniqueSnippets = Array.from(
      new Set(matched_pairs.map((pair) => pair.doc1_sentence))
    );

    return (text: string) => {
      let markedText = text;
      uniqueSnippets.forEach((snippet) => {
        const escaped = snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "g");
        markedText = markedText.replace(
          regex,
          `<mark class="highlight">${snippet}</mark>`
        );
      });
      return markedText;
    };
  }, [matched_pairs]);

  // Group matched pairs by source file
  const groupedBySource = React.useMemo(() => {
    const groups: Record<string, MatchedPair[]> = {};
    matched_pairs.forEach((pair) => {
      if (!groups[pair.source_file]) {
        groups[pair.source_file] = [];
      }
      groups[pair.source_file].push(pair);
    });
    return groups;
  }, [matched_pairs]);

  return (
    <>
      <style>{`
        mark.highlight {
          background-color: rgba(255, 99, 71, 0.3);
          border-radius: 3px;
          padding: 0 2px;
          transition: background-color 0.2s ease;   
        }
        mark.highlight:hover {
          background-color: rgba(255, 99, 71, 0.5);
        }
      `}</style>

      <motion.section
        id="result-section"
        ref={resultRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white rounded-xl p-8 shadow-xl text-gray-900 mb-12 min-h-[600px]"
      >
        {/* Header */}
        <div className="relative mb-6 w-full">
          <p className="absolute top-0 right-0 text-sm text-gray-600 whitespace-nowrap">
            Scanned on: {new Date().toLocaleString()}
          </p>

          <div className="flex items-center justify-center space-x-3">
            <h2 className="text-3xl font-bold text-blue-800">Result Summary</h2>
            <button
              className="text-blue-600 hover:text-blue-800 transition"
              onClick={() =>
                handleDownloadPDF("result-section", {
                  title: "Plagiarism Scan Report",
                  timestamp: new Date().toLocaleString(),
                  duration: `${elapsedTime} seconds`,
                })
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scores section */}
        <div className="flex flex-row lg:flex-row mb-8 gap-12">
          <div className="flex-1 max-w-xs mx-auto lg:mx-0">
            <h3 className="font-semibold mb-8 ml-4 text-center lg:text-left">
              Plagiarism Score
            </h3>
            <div
              style={{ width: 200, height: 200 }}
              className="mx-auto lg:mx-0"
            >
              <CircularProgressbar
                value={animatedPercentage ?? computedPercentage}
                text={`${animatedPercentage ?? computedPercentage}%`}
                styles={buildStyles({
                  textColor: getPathColor(
                    animatedPercentage ?? computedPercentage
                  ),
                  pathColor: getPathColor(
                    animatedPercentage ?? computedPercentage
                  ),
                  trailColor: "#dbeafe",
                  textSize: "18px",
                })}
              />
            </div>
          </div>

          <div className="space-y-2 mt-4 w-full max-w-xs">
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-700">Exact Match</p>
              <p className="text-2xl font-bold text-red-600">
                {total_exact_score}%
              </p>
            </div>
            <div className="bg-yellow-50 p-3 px-3 rounded-lg">
              <p className="text-sm text-yellow-700">Partial Match</p>
              <p className="text-2xl font-bold text-yellow-600">
                {total_partial_score}%
              </p>
            </div>
            <div className="bg-green-50 p-3 px-4 rounded-lg">
              <p className="text-sm text-green-700">Unique</p>
              <p className="text-2xl font-bold text-green-600">
                {unique_score}%
              </p>
            </div>
          </div>

          {/* Citation */}
          {resultData?.scanProperties?.citationStatus && (
            <div
              className={`mt-6 border-l-4 p-4 w-128 h-28 mb-10 rounded shadow-sm ${getCitationStyles(
                resultData.scanProperties.citationStatus
              )}`}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6M4 6h16"
                  />
                </svg>
                <h4 className="text-lg font-semibold">
                  {citationInfo[resultData.scanProperties.citationStatus].label}
                </h4>
              </div>
              <p className="mt-1 text-sm">
                {
                  citationInfo[resultData.scanProperties.citationStatus]
                    .description
                }
              </p>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-4 mb-12 mt-12">
          {/* Submitted Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-800">
                  Submitted Content
                </h3>
              </div>
              <div
                className="p-4 overflow-auto max-h-[400px] text-sm text-gray-800 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlightSubmittedContent(submittedDocument),
                }}
              />
              <div className="bg-gray-50 px-4 py-2 border-t text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>
                    <span className="font-medium">Words:</span>{" "}
                    {scanProperties.words.toLocaleString()}
                  </span>
                  <span>
                    <span className="font-medium">Characters:</span>{" "}
                    {scanProperties.characters.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Matched Sources */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-800">
                  Matched Sources ({Object.keys(groupedBySource).length})
                </h3>
              </div>
              <div className="p-4 overflow-auto max-h-[400px]">
                {Object.keys(groupedBySource).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(groupedBySource).map(
                      ([sourceFile, pairs], i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-medium text-blue-600 truncate mb-2">
                            {sourceFile}
                          </h4>
                          <ul className="space-y-2">
                            {pairs.map((p, idx) => (
                              <li key={idx} className="text-sm">
                                <div className="flex items-start gap-2">
                                  <span
                                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      p.type === "exact"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {p.type === "exact" ? "Exact" : "Partial"}
                                  </span>
                                  <p className="flex-1">
                                    {p.doc2_sentence}
                                    <span className="block text-xs text-gray-500 mt-1">
                                      Similarity:{" "}
                                      {(p.similarity * 100).toFixed(1)}%
                                    </span>
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No matched sources found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Matches */}
        <div className="mt-6">
          <div className="bg-white rounded-lg mb-6 border  border-gray-200 overflow-hidden shadow">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">
                Detailed Matches ({matched_pairs.length})
              </h3>
            </div>
            <div className="p-4 overflow-auto max-h-[400px]">
              {matched_pairs.length > 0 ? (
                <div className="space-y-3">
                  {matched_pairs.map((pair, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        pair.type === "exact" ? "bg-red-50" : "bg-yellow-50"
                      }`}
                    >
                      <div className="mb-2">
                        <span className="font-medium">Your text:</span>{" "}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: `<mark class="highlight">${pair.doc1_sentence}</mark>`,
                          }}
                        />
                      </div>
                      <div className="mb-1">
                        <span className="font-medium">
                          {pair.type === "exact" ? "Exact" : "Partial"} match:
                        </span>{" "}
                        {pair.doc2_sentence}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span>
                          <span className="font-medium">Source:</span>{" "}
                          {pair.source_file}
                        </span>
                        <span>
                          <span className="font-medium">Similarity:</span>{" "}
                          {(pair.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  <p className="text-green-500 text-center py-4">
                   Avoid copying large blocks of text directly; focus on summarizing
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No detailed matches found
                </p>
              )}
            </div>
          </div>
        </div>

        {noPlagiarismFound && (
          <div className="mt-6 p-4 bg-green-100 rounded-lg text-green-800 font-medium text-center">
            No plagiarism detected. Your document is unique!
          </div>
        )}
      </motion.section>
    </>
  );
};

export default ResultSummary;
