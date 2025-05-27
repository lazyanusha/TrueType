import React, { useState, useRef, useEffect } from "react";
import Confetti from "react-confetti";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { handleDownloadPDF } from "../utils/HandleDownloadPdf";

interface MatchedSource {
	url: string;
	title: string;
	snippet: string;
}

interface ResultData {
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

const features = [
	{
		icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
		title: "Improving Accuracy",
		description:
			"We're constantly refining our algorithm to detect subtle similarities",
	},
	{
		icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
		title: "Efficient Processing",
		description: "Designed to deliver plagiarism results in minimal time",
	},
	{
		icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
		title: "Smart Dataset Comparison",
		description:
			"Currently checks against a limited dataset, with ongoing updates",
	},
];

const Home = () => {
	const [wordCount, setWordCount] = useState(0);
	const [text, setText] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [resultData, setResultData] = useState<ResultData | null>(null);
	const [loading, setLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [animatedPercentage, setAnimatedPercentage] = useState(0);

	const fileInputRef = useRef<HTMLInputElement>(null);
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

	const handleFileUpload = () => {
		fileInputRef.current?.click();
	};

	const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFiles(Array.from(e.target.files));
		}
	};

	const removeFile = (index: number) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};

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
					 citationStatus: "Partial",
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
					<section className="bg-white rounded-xl p-8 shadow-xl mb-12 text-gray-900 relative">
						{/* File Upload Box */}
						<div
							className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-blue-500 ${
								loading ? "opacity-50 cursor-not-allowed" : "border-gray-300"
							}`}
							onClick={handleFileUpload}
						>
							<p className="text-lg font-semibold">
								Drag and drop your files here or click to upload
							</p>
							<p className="text-sm text-gray-600 mt-1">
								Supports multiple files
							</p>
							<input
								ref={fileInputRef}
								type="file"
								className="hidden"
								multiple
								onChange={handleFilesSelected}
								disabled={loading}
							/>
						</div>

						{/* Textarea */}
						<div className="relative mt-6">
							<textarea
								className="w-full h-48 border border-gray-300 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Paste your text here to check for plagiarism..."
								value={text}
								onChange={handleTextChange}
								disabled={loading}
							/>

							{/* Clear Button for Text */}
							{text && (
								<button
									onClick={clearText}
									className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full w-7 h-7 flex items-center justify-center text-gray-700"
									aria-label="Clear text"
									title="Clear text"
									disabled={loading}
								>
									&times;
								</button>
							)}
						</div>

						<div className="mt-4 flex justify-between items-center">
							<span
								className={`text-sm ${
									wordCount > 1000 ? "text-red-600 font-bold" : "text-gray-700"
								}`}
							>
								Words: {wordCount} / 1000
							</span>

							<button
								onClick={handleCheckPlagiarism}
								disabled={loading}
								className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading && (
									<motion.div
										animate={{ rotate: 360 }}
										transition={{
											repeat: Infinity,
											duration: 2,
											ease: "linear",
										}}
										className="w-5 h-5 border-4 border-white border-t-transparent rounded-full mr-3"
									/>
								)}
								Check for Plagiarism
							</button>
						</div>

						{/* File List with per-file clear buttons */}
						{files.length > 0 && (
							<div className="mt-4 text-sm text-gray-700 space-y-1">
								<p>Uploaded files:</p>
								<ul>
									{files.map((file, i) => (
										<li
											key={i}
											className="flex items-center justify-between border border-gray-300 rounded px-3 py-1"
										>
											<span>{file.name}</span>
											<button
												type="button"
												onClick={() => removeFile(i)}
												className="text-red-700 hover:text-red-800 font-bold ml-3"
												aria-label={`Remove file ${file.name}`}
												disabled={loading}
											>
												&times;
											</button>
										</li>
									))}
								</ul>
							</div>
						)}
					</section>
					{/* Result Section */}

					<AnimatePresence>
						{showResults && resultData && (
							<motion.section
								ref={resultRef}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 30 }}
								className="bg-white rounded-xl p-8 shadow-xl text-gray-900 mb-12 min-h-[600px]"
							>
								<div className="flex items-center justify-center mb-6 space-x-3">
									<h2 className="text-3xl font-bold text-center text-blue-800">
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
										{/* Simple download SVG icon */}
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

								<div className="flex flex-col md:flex-row gap-4">
									{/* Submitted Text */}
									<div className="bg-white rounded-lg shadow-md p-6 flex-1">
										<h3 className="text-lg font-semibold mb-4 text-gray-900">
											Submitted Content
										</h3>

										<div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-110 overflow-auto whitespace-pre-wrap text-sm text-gray-800">
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

											<p>
												<span className="font-medium text-gray-800">
													Citation Status:
												</span>{" "}
												<span
													className={
														resultData.scanProperties.citationStatus ===
														"Proper"
															? "text-green-600"
															: resultData.scanProperties.citationStatus ===
															  "Partial"
															? "text-yellow-600"
															: resultData.scanProperties.citationStatus ===
															  "False"
															? "text-red-600"
															: resultData.scanProperties.citationStatus ===
															  "Poor"
															? "text-orange-500"
															: "text-gray-500"
													}
												>
													{resultData.scanProperties.citationStatus}
												</span>
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

										<div className="grid gap-4 max-h-[440px] overflow-y-auto pr-2">
											{resultData.matchedSources.map((source, i) => (
												<div
													key={i}
													className="border border-gray-300 rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow duration-200"
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
									</div>

									{/* Pie Chart */}
									<div className="flex-1 flex flex-col items-center justify-center">
										<h3 className="font-semibold mb-4">Plagiarism</h3>
										<div style={{ width: 200, height: 200 }}>
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
									</div>
								</div>
							</motion.section>
						)}
					</AnimatePresence>
					{/* Features Section */}
					<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-8">
						<h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
							Reasons to Pick Our Plagiarism Checker
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-900">
							{features.map((feature, index) => (
								<div
									key={index}
									className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
								>
									<svg
										className="h-10 w-10 text-blue-600 mb-4"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d={feature.icon}
										></path>
									</svg>
									<h4 className="text-xl font-semibold mb-2">
										{feature.title}
									</h4>
									<p className="text-gray-700">{feature.description}</p>
								</div>
							))}
						</div>
					</section>
				</div>
			</motion.div>
		</div>
	);
};

export default Home;
