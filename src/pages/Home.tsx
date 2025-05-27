import { useState, useRef, useEffect } from "react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { handleDownloadPDF } from "../utils/HandleDownloadPdf";
import type { ResultData } from "../types/resultTypes";
import { citationInfo } from "../constants/citationInfo";
import { getCitationStyles } from "../utils/getCitationStyles";
import FeaturesSection from "../components/FeaturesSection";
import ResultSummary from "../components/ResultSummary";
import FileUploadHandle from "../components/FileUpholadHandle";

const Home = () => {
	const [resultData, setResultData] = useState<ResultData | null>(null);
	const [showResults, setShowResults] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [animatedPercentage, setAnimatedPercentage] = useState(0);
	const [loading, setLoading] = useState(false);

	const resultRef = useRef<HTMLDivElement>(null);

	const handleCheck = async (file: File) => {
		setLoading(true);
		try {
			// Wrap file in FormData for upload
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("http://localhost:8000/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			setResultData(result);
			setShowResults(true);
			setShowConfetti(true);
			setTimeout(() => setShowConfetti(false), 5000);
		} catch (error) {
			alert("Failed to check plagiarism: " + (error as Error).message);
		} finally {
			setLoading(false);
		}
	};

	// Animate pie chart
	useEffect(() => {
		if (showResults && resultData) {
			let progress = 0;
			const target = resultData.plagiarism.percentage;
			const duration = 2000;
			const increment = target / (duration / 20);
			let mounted = true;

			const timer = setInterval(() => {
				progress += increment;
				if (progress >= target) {
					progress = target;
					clearInterval(timer);
				}
				if (mounted) setAnimatedPercentage(Math.round(progress));
			}, 20);

			return () => {
				mounted = false;
				clearInterval(timer);
			};
		}
	}, [showResults, resultData]);

	// Scroll to result section smoothly
	useEffect(() => {
		if (showResults && resultRef.current) {
			const element = resultRef.current;
			const top = element.offsetTop;
			window.scrollTo({
				top: top - window.innerHeight / 2 + element.offsetHeight / 2,
				behavior: "smooth",
			});
		}
	}, [showResults]);

	// Confetti auto off
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		if (showConfetti) {
			timeoutId = setTimeout(() => setShowConfetti(false), 5000);
		}
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [showConfetti]);

	const getPathColor = (percentage: number) => {
		if (percentage <= 15) return "#16a34a";
		if (percentage <= 40) return "#f97316";
		return "#dc2626";
	};

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
					<FileUploadHandle onCheck={handleCheck} loading={loading} />

					{/* Result Section */}
					<AnimatePresence>
						{showResults && resultData && (
							<ResultSummary
								showResults={showResults}
								resultData={resultData}
								animatedPercentage={animatedPercentage}
								elapsedTime={0}
								resultRef={resultRef}
								handleDownloadPDF={handleDownloadPDF}
								citationInfo={citationInfo}
								getPathColor={getPathColor}
								getCitationStyles={getCitationStyles}
							/>
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
