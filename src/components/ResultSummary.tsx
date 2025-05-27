import React from "react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import type { ResultData } from "../types/resultTypes";
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
	return (
		<motion.section
			id="result-section"
			ref={resultRef}
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 30 }}
			className="bg-white rounded-xl p-8 shadow-xl text-gray-900 mb-12 min-h-[600px]"
		>
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
						aria-label="Download Report"
						title="Download Report"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-7 w-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4M12 4v8"
							/>
						</svg>
					</button>
				</div>
			</div>

			<h3 className="font-semibold mb-4 ml-4">Plagiarism %</h3>
			<div className="flex-1 flex flex-row items-start justify-start gap-10">
				<div style={{ width: 150, height: 150 }}>
					<CircularProgressbar
						value={animatedPercentage}
						text={`${animatedPercentage}%`}
						styles={buildStyles({
							textColor: getPathColor(animatedPercentage),
							pathColor: getPathColor(animatedPercentage),
							trailColor: "#dbeafe",
							textSize: "18px",
						})}
					/>
				</div>

				<div className="mt-6 space-y-2 w-full max-w-xs">
					<div className="flex justify-between text-red-600 font-semibold">
						<span>Exact Match</span>
						<span>{resultData.plagiarism.exactMatch}%</span>
					</div>
					<div className="flex justify-between text-yellow-600 font-semibold">
						<span>Partial Match</span>
						<span>{resultData.plagiarism.partialMatch}%</span>
					</div>
					<div className="flex justify-between text-green-600 font-semibold">
						<span>Unique</span>
						<span>{resultData.plagiarism.unique}%</span>
					</div>
				</div>

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

			<div className="flex flex-col md:flex-row gap-4">
				<div className="flex-1">
					<h3 className="text-lg font-semibold mb-4 text-gray-900">
						Submitted Content
					</h3>
					<div className="border border-gray-200 rounded-lg p-4 bg-white rounded-lg shadow-md p-6 flex-1 h-90 overflow-auto whitespace-pre-wrap text-sm text-gray-800">
						{resultData.submittedDocument}
					</div>
					<div className="mt-4 border-t pt-3 text-sm text-gray-600 space-y-2">
						<p>
							<span className="font-medium text-gray-800">Words:</span>{" "}
							{resultData.scanProperties.words} &nbsp;|&nbsp;
							<span className="font-medium text-gray-800">
								Characters:
							</span>{" "}
							{resultData.scanProperties.characters}
						</p>
						<p className="text-xs italic text-gray-500">
							{
								{
									Proper: "Properly credited with correct format.",
									Partial: "Citation present but lacks detail.",
									False: "Cited source doesn’t match content.",
									Poor: "Citation exists but unclear or weak.",
									None: "No citation found for matched content.",
								}[resultData.scanProperties.citationStatus]
							}
						</p>
					</div>
				</div>

				<div className="flex-1">
					<h3 className="font-semibold text-lg mb-4">
						Matched Sources ({resultData.scanProperties.sourcesFound})
					</h3>
					{resultData.matchedSources.length > 0 ? (
						<div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
							{resultData.matchedSources.map((source, i) => (
								<div
									key={i}
									className="source-card border border-gray-300 rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow duration-200"
								>
									<h4 className="font-semibold text-blue-600 truncate mb-1">
										<a
											href={source.url}
											target="_blank"
											rel="noreferrer"
											className="hover:underline"
										>
											{source.title || source.url}
										</a>
									</h4>
									<p className="text-sm text-gray-700 line-clamp-3">
										{source.snippet}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-600">No matched sources found.</p>
					)}
					<p className="text-sm text-gray-600 mt-2">
						<strong>Time Taken to Scan:</strong> {elapsedTime} seconds
					</p>
				</div>
			</div>
		</motion.section>
	);
};

export default ResultSummary;
