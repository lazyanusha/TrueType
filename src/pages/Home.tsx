import React, { useState, useRef, useEffect } from "react";
import Confetti from "react-confetti";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { handleDownloadPDF } from "../utils/HandleDownloadPdf";
import type { ResultData } from "../types/resultTypes";
import { citationInfo } from "../constants/citationInfo";
import { getCitationStyles } from "../utils/getCitationStyles";
import FileUploadSection from "../components/FileUploadSection";
import FeaturesSection from "../components/FeaturesSection";

const Home = () => {
	const [wordCount, setWordCount] = useState(0);
	const [text, setText] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [resultData, setResultData] = useState<ResultData | null>(null);
	const [loading, setLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [animatedPercentage, setAnimatedPercentage] = useState(0);

	const resultRef = useRef<HTMLDivElement>(null);

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const textValue = e.target.value;
		setText(textValue);
		const words = textValue.trim() ? textValue.trim().split(/\s+/) : [];
		setWordCount(words.length);
	};

	const clearText = () => {
		setText("");
		setWordCount(0);
	};

	const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFiles(Array.from(e.target.files));
		}
	};

	const removeFile = (index: number) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};

	function detectCitationStatus(
		text: string
	): "Proper" | "Partial" | "False" | "Poor" | "None" {
		const lower = text.toLowerCase();

		const hasCitationPatterns =
			/\b(et al\.|doi:|retrieved from|https?:\/\/|according to|in \[\d+\])/.test(
				lower
			);
		const hasFakePatterns =
			/\b(fakesource\.com|loremipsum|notarealjournal)/.test(lower);
		const citationCount = (lower.match(/(et al\.|doi:|https?:\/\/)/g) || [])
			.length;

		if (!hasCitationPatterns) return "None";
		if (hasFakePatterns) return "False";
		if (citationCount >= 3) return "Proper";
		if (citationCount === 2) return "Partial";
		if (citationCount === 1) return "Poor";
		return "None";
	}

	// Function to determine path color by percentage
	const getPathColor = (percentage: number) => {
		if (percentage <= 15) return "#16a34a"; // green
		if (percentage <= 40) return "#f97316"; // orange
		return "#dc2626"; // red
	};

	const startTime = performance.now(); // before scan
	const endTime = performance.now(); // after scan

	const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

	const handleCheckPlagiarism = () => {
		if (wordCount === 0 && files.length === 0) {
			alert("Please input text or upload at least one file.");
			return;
		}
		setLoading(true);
		setShowResults(false);
		setShowConfetti(true);
		setAnimatedPercentage(0);

		// Stop fireworks after 4 seconds
		setTimeout(() => setShowConfetti(false), 4000);
		const citationStatus = detectCitationStatus(text);
		setTimeout(() => {
			const fakeResponse: ResultData = {
				submittedDocument:
					text || (files.length > 0 ? files.map((f) => f.name).join(", ") : ""),
				matchedSources: [
					{
						url: "https://example.com/source1",
						title: "Understanding Machine Learning",
						snippet:
							"Machine learning is a method of data analysis that automates analytical model building...",
					},
					{
						url: "https://example.com/source2",
						title: "AI in Education Sector",
						snippet:
							"This article discusses the impact of artificial intelligence on modern educational systems...",
					},
					{
						url: "https://example.com/source2",
						title: "AI in Education Sector",
						snippet:
							"This article discusses the impact of artificial intelligence on modern educational systems...",
					},
					{
						url: "https://example.com/source2",
						title: "AI in Education Sector",
						snippet:
							"This article discusses the impact of artificial intelligence on modern educational systems...",
					},
					{
						url: "https://example.com/source2",
						title: "AI in Education Sector",
						snippet:
							"This article discusses the impact of artificial intelligence on modern educational systems...",
					},
					{
						url: "https://example.com/source3",
						title: "History of Natural Language Processing",
						snippet:
							"NLP has evolved significantly over the decades, enabling machines to understand human language...",
					},
				],
				scanProperties: {
					sourcesFound: 3,
					words: wordCount,
					characters: text.length,
					citationStatus,
				},
				plagiarism: {
					percentage: 22,
					exactMatch: 8,
					partialMatch: 14,
					unique: 78,
				},
			};

			setResultData(fakeResponse);
			setLoading(false);
			setShowResults(true);

			// Scroll to results smoothly after showing them
			if (resultRef.current) {
				resultRef.current.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		}, 3500);
	};

	// Animate the pie chart percentage from 0 to final value
	useEffect(() => {
		if (showResults && resultData) {
			let start = 0;
			const end = resultData.plagiarism.percentage;
			const duration = 2000; // 2 seconds
			const increment = end / (duration / 20); // update every 20ms

			const interval = setInterval(() => {
				start += increment;
				if (start >= end) {
					start = end;
					clearInterval(interval);
				}
				setAnimatedPercentage(Math.round(start));
			}, 20);

			return () => clearInterval(interval);
		}
	}, [showResults, resultData]);

	useEffect(() => {
		if (showResults && resultRef.current) {
			const element = resultRef.current;
			const elementRect = element.getBoundingClientRect();
			const absoluteElementTop = elementRect.top + window.pageYOffset;
			const middleScreen = window.innerHeight / 2;
			const elementMiddle = elementRect.height / 2;

			const scrollTo = absoluteElementTop - middleScreen + elementMiddle;

			window.scrollTo({
				top: scrollTo,
				behavior: "smooth",
			});
		}
	}, [showResults]);

	const pageBackgroundStyle = {
		backgroundColor: "#f0f9ff",
		minHeight: "100vh",
		paddingTop: "3rem",
		paddingBottom: "3rem",
	};

	return (
		<div style={pageBackgroundStyle}>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1 }}
				className="max-w-7xl mx-auto relative z-10"
			>
				<div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
					{showConfetti && <Confetti numberOfPieces={250} recycle={false} />}
					<header className="mb-12 text-center">
						<h1 className="text-4xl font-extrabold mb-4 text-blue-900">
							TrueType – Originality You Can Trust
						</h1>
						<p className="text-lg max-w-2xl mx-auto text-gray-800">
							Ensure the originality of your content with our powerful
							plagiarism checker.
						</p>
					</header>
					{/* Input Section */}
					<div>
						<FileUploadSection
							loading={loading}
							files={files}
							text={text}
							wordCount={wordCount}
							handleFilesSelected={handleFilesSelected}
							handleTextChange={handleTextChange}
							handleCheckPlagiarism={handleCheckPlagiarism}
							clearText={clearText}
							removeFile={removeFile}
						/>
					</div>
					{/* Result Section */}

					<AnimatePresence>
						{showResults && resultData && (
							<motion.section
								id="result-section"
								ref={resultRef}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 30 }}
								className="bg-white rounded-xl p-8 shadow-xl text-gray-900 mb-12 min-h-[600px]"
							>
								<div className="relative mb-6 w-full">
									{/* Right-aligned date/time */}
									<p className="absolute top-0 right-0 text-sm text-gray-600 whitespace-nowrap">
										Scanned on: {new Date().toLocaleString()}
									</p>

									{/* Centered title + icon */}
									<div className="flex items-center justify-center space-x-3">
										<h2 className="text-3xl font-bold text-blue-800">
											Result Summary
										</h2>
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

								{/* Pie Chart */}
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

									{/* Breakdown */}
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
													{
														citationInfo[
															resultData.scanProperties.citationStatus
														].label
													}
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
									{/* Submitted Text */}

									<div className="flex-1">
										<h3 className="text-lg font-semibold mb-4 text-gray-900">
											Submitted Content
										</h3>
										<div className="border border-gray-200 rounded-lg p-4 bg-white rounded-lg shadow-md p-6 flex-1 h-90 overflow-auto whitespace-pre-wrap text-sm text-gray-800">
											{resultData.submittedDocument}
										</div>

										<div className="mt-4 border-t pt-3 text-sm text-gray-600 space-y-2">
											<p>
												<span className="font-medium text-gray-800">
													Words:
												</span>{" "}
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

									{/* Matched Sources */}
									<div className="flex-1">
										<h3 className="font-semibold text-lg mb-4">
											Matched Sources ({resultData.scanProperties.sourcesFound})
										</h3>
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
										<p className="text-sm text-gray-600 mt-2">
											<strong>Time Taken to Scan:</strong> {elapsedTime} seconds
										</p>
									</div>
								</div>
							</motion.section>
						)}
					</AnimatePresence>

					{/* Features Section */}
					<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-8">
						<FeaturesSection />
					</section>
				</div>
			</motion.div>
		</div>
	);
};

export default Home;
