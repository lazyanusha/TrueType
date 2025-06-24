import { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { resultTypes } from "../../components/publilc/types/resultTypes";
import { citationInfo } from "../../components/publilc/constants/citationInfo";
import ConfettiEffect from "../../components/user_component/ConfettieEffect";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/auth_context";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import FeaturesSection from "../../components/user_component/FeaturesSection";
import ResultSummary from "../../components/user_component/ResultSummary";
import { handleDownloadPDF } from "../../components/publilc/handler/HandleDownloadPdf";
import { getCitationStyles } from "../../utils/getCitationStyles";
import PlagiarismChecker from "../../components/user_component/PlagiarismChecker";
import { checkPlagiarism } from "../../utils/PlagiarismService";
import { saveReportToDB } from "../../utils/reportsave";

const MAX_LOADING_TIME = 60;

const Home = () => {
	const [resultData, setResultData] = useState<resultTypes | null>(null);
	const [showResults, setShowResults] = useState(false);
	const [animatedPercentage, setAnimatedPercentage] = useState(0);
	const [loading, setLoading] = useState(false);
	const [elapsedTime, setElapsedTime] = useState<number>(0);
	const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
	const loadingStartTimeRef = useRef<number>(0);
	const navigate = useNavigate();
	const resultRef = useRef<HTMLDivElement>(null);
	const { user, loading: authLoading, logout } = useContext(AuthContext);
	const hasShownAlert = useRef(false);

	useEffect(() => {
		if (
			!authLoading &&
			user &&
			user.subscription_status !== "active" &&
			!hasShownAlert.current
		) {
			hasShownAlert.current = true;
			confirmAlert({
				title: "Subscription Inactive",
				message:
					"Your subscription is inactive. Would you like to go to the payment page to activate it?",
				buttons: [
					{
						label: "Yes",
						onClick: () => navigate("/subscription"),
					},
					{
						label: "No",
						onClick: () => {
							logout();
							alert("You have been logged out.");
						},
					},
				],
				closeOnEscape: false,
				closeOnClickOutside: false,
			});
		}
	}, [authLoading, user, navigate, logout]);

	useEffect(() => {
		if (loading) {
			loadingStartTimeRef.current = Date.now();
			setElapsedTime(0);

			loadingTimerRef.current = setInterval(() => {
				const now = Date.now();
				const secondsElapsed = Math.floor(
					(now - loadingStartTimeRef.current) / 1000
				);
				setElapsedTime(
					secondsElapsed > MAX_LOADING_TIME ? MAX_LOADING_TIME : secondsElapsed
				);
			}, 500);
		} else if (loadingTimerRef.current) {
			clearInterval(loadingTimerRef.current);
			loadingTimerRef.current = null;
		}

		return () => {
			if (loadingTimerRef.current) {
				clearInterval(loadingTimerRef.current);
				loadingTimerRef.current = null;
			}
		};
	}, [loading]);

	// Animate pie chart on result
	useEffect(() => {
		if (showResults && resultData) {
			let progress = 0;
			const target =
				(resultData.total_exact_score ?? 0) +
				(resultData.total_partial_score ?? 0);
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

	// Scroll to result section
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

	// Handle plagiarism check
	const handleCheck = async (file: File) => {
		setLoading(true);
		const start = Date.now();

		try {
			// ⏱️ Elapsed time tracking
			const resultData: resultTypes = await checkPlagiarism(file);
			const end = Date.now();
			const elapsed = Math.round((end - start) / 1000);
			setElapsedTime(elapsed);

			// 🧠 Save result in DB if logged in
			const token =
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token");
			if (token) {
				try {
					const saveResult = await saveReportToDB(resultData, token);

					if (saveResult.success) {
						console.log(`✅ Report saved! Report ID: ${saveResult.report_id}`);
					} else {
						console.warn(`⚠️ Report not saved: ${saveResult.message}`);
					}
				} catch (err: any) {
					console.error(`❌ Error saving report: ${err.message}`);
				}
			}

			// Update results
			setResultData(resultData);
			setShowResults(true);
		} catch (err: any) {
			alert(`Error during plagiarism check: ${err.message}`);
			setShowResults(false);
		} finally {
			setLoading(false);
		}
	};

	const getPathColor = (percentage: number) => {
		if (percentage <= 15) return "#16a34a";
		if (percentage <= 40) return "#f97316";
		return "#dc2626";
	};

	const handleResult = (data: resultTypes) => {
		setResultData(data);
	};

	const handleShowResults = () => {
		setShowResults(true);
	};

	const pageBackgroundStyle = {
		backgroundColor: "#f0f9ff",
		minHeight: "100vh",
		paddingTop: "3rem",
		paddingBottom: "3rem",
	};

	if (authLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				Checking authentication...
			</div>
		);
	}

	return (
		<div style={pageBackgroundStyle}>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1 }}
				className="max-w-7xl mx-auto relative z-10"
			>
				<div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
					{/* Show confetti only when NOT loading, result unique_score is 100, and results visible */}
					<ConfettiEffect
						active={!loading && resultData?.unique_score === 100 && showResults}
					/>

					<header className="mb-12 mt-10 text-center">
						<h1 className="text-4xl font-extrabold mb-4 text-blue-900">
							TrueType – Originality You Can Trust
						</h1>
						<p className="text-lg max-w-2xl mx-auto text-gray-800">
							Ensure the originality of your content with our powerful
							plagiarism checker.
						</p>
					</header>

					{/* Input Section */}
					<PlagiarismChecker
						onCheck={handleCheck}
						onResult={handleResult}
						onShowResults={handleShowResults}
						loading={loading}
						elapsedTime={elapsedTime}
					/>

					{/* Result Section */}
					<AnimatePresence>
						{resultData && (
							<ResultSummary
								resultData={resultData}
								animatedPercentage={animatedPercentage}
								elapsedTime={elapsedTime}
								showResults={showResults}
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
