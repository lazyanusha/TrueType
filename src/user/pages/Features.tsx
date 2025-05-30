import { useState } from "react";
import { motion } from "framer-motion";
import Snowing from "../components/Snowing";

const Features = () => {
	const [, setIsAnimationComplete] = useState(false);

	const pageBackgroundStyle: React.CSSProperties = {
		backgroundColor: "#f0f9ff",
		paddingTop: "2rem",
		paddingBottom: "2rem",
	};

	const contentWrapperStyle: React.CSSProperties = {
		position: "relative",
		zIndex: 1,
	};

	return (
		<div style={pageBackgroundStyle}>
			<Snowing />

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1 }}
				onAnimationComplete={() => setIsAnimationComplete(true)}
				className="max-w-7xl mx-auto relative z-10"
			>
				<div
					style={contentWrapperStyle}
					className="max-w-7xl mx-auto py-32 px-4 sm:px-6 lg:px-8"
				>
					<div className="text-center mb-12 mt-20">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Features</h1>
						<p className="text-gray-600">
							Explore what makes{" "}
							<span className="font-semibold text-blue-600">TrueType</span>{" "}
							useful and trustworthy
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
						{[
							{
								title: "Curated Dataset",
								description:
									"Matches text against a carefully selected internal dataset of documents and user entries",
								icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
							},
							{
								title: "Efficient Processing",
								description:
									"Receive similarity insights within moments using optimized comparison logic",
								icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
							},
							{
								title: "Readable Reports",
								description:
									"View simplified results with similarity score and flagged sections",
								icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
							},
						].map((feature, index) => (
							<div
								key={index}
								className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
							>
								<div className="flex items-center mb-4">
									<div className="p-2 bg-blue-100 rounded-full mr-4">
										<svg
											className="w-6 h-6 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d={feature.icon}
											/>
										</svg>
									</div>
									<h3 className="text-lg font-semibold">{feature.title}</h3>
								</div>
								<p className="text-gray-600">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default Features;
