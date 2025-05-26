import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";

const steps = [
	{
		number: "1",
		title: "Upload Your Content",
		description:
			"Paste your text directly or upload documents in various formats including DOCX, PDF, and TXT.",
		icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
	},
	{
		number: "2",
		title: "Focused Content Analysis",
		description:
			"Our system compares your text against a curated collection of trusted sources for reliable results.",
		icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
	},
	{
		number: "3",
		title: "Detailed Analysis",
		description:
			"We analyze sentence structures, paraphrasing, and even translated content to detect similarities.",
		icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
	},
	{
		number: "4",
		title: "Comprehensive Report",
		description:
			"Receive a detailed report highlighting potential matches with sources and similarity percentages.",
		icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
	},
];

interface StepType {
	number: string;
	title: string;
	description: string;
	icon: string;
}

const stepVariants = {
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
	hidden: { opacity: 0, y: 30, transition: { duration: 0.4, ease: "easeIn" } },
};

const HowItWorks = () => {
	const fireworksInterval = useRef<number | null>(null);

	useEffect(() => {
		// Function to shoot fireworks randomly on the screen
		function shootFireworks() {
			const x = Math.random();
			const y = Math.random() * 0.5; // Upper half screen

			confetti({
				particleCount: 30,
				startVelocity: 30,
				spread: 360,
				origin: { x, y },
				colors: [
					"#ff0055",
					"#ff5500",
					"#ffaa00",
					"#55ff00",
					"#00ffaa",
					"#0055ff",
					"#aa00ff",
				],
			});
		}

		fireworksInterval.current = setInterval(shootFireworks, 2000);

		return () => {
			if (fireworksInterval.current !== null) {
				clearInterval(fireworksInterval.current);
			}
		};
	}, []);

	return (
		<div
			style={{
				position: "relative",
				minHeight: "100vh",
				overflow: "hidden",
				backgroundColor: "#f0f9ff", // Light blue background
			}}
		>
			{/* Main Content */}
			<div
				className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
				style={{ position: "relative", zIndex: 1 }}
			>
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						How It Works
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Our simple four-step process delivers reliable plagiarism detection
					</p>
				</div>

				<div className="space-y-12">
					{steps.map((step, index) => (
						<Step key={index} step={step} />
					))}
				</div>

				<div className="mt-16 bg-blue-50 rounded-xl p-8">
					<h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
						Why Choose Our Plagiarism Checker?
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-white p-6 rounded-lg shadow-sm">
							<h3 className="font-semibold text-gray-800 mb-2">
								Academic Integrity
							</h3>
							<p className="text-gray-600">
								Essential for students and researchers to ensure original work
								and proper citations.
							</p>
						</div>
						<div className="bg-white p-6 rounded-lg shadow-sm">
							<h3 className="font-semibold text-gray-800 mb-2">
								Professional Content
							</h3>
							<p className="text-gray-600">
								Protect your brand reputation by ensuring all published content
								is original.
							</p>
						</div>
						<div className="bg-white p-6 rounded-lg shadow-sm">
							<h3 className="font-semibold text-gray-800 mb-2">SEO Benefits</h3>
							<p className="text-gray-600">
								Duplicate content can harm your search rankings. Our tool helps
								you avoid penalties.
							</p>
						</div>
						<div className="bg-white p-6 rounded-lg shadow-sm">
							<h3 className="font-semibold text-gray-800 mb-2">
								Legal Protection
							</h3>
							<p className="text-gray-600">
								Avoid copyright infringement issues by verifying content
								originality before publication.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const Step: React.FC<{ step: StepType }> = ({ step }) => {
	const ref = React.useRef(null);
	const isInView = useInView(ref, { once: false, margin: "-100px" });

	return (
		<motion.div
			ref={ref}
			variants={stepVariants}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
			className="p-6 rounded-xl shadow-md bg-white/0"
		>
			<div className="flex items-start">
				<div
					className="flex-shrink-0 mr-4 text-blue-600 font-bold text-xl"
					style={{
						width: 36,
						height: 36,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{step.number}
				</div>
				<div>
					<h2 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h2>
					<p className="text-gray-600 mb-4">{step.description}</p>
					<div className="flex items-center text-gray-500">
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d={step.icon}
							/>
						</svg>
						<span>Step {step.number}</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default HowItWorks;
