import React from "react";
import { features } from "../public/constants/features";

interface Feature {
	icon: string;
	title: string;
	description: string;
}

const FeaturesSection: React.FC = () => {
	return (
		<>
			<h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
				Reasons to Pick Our Plagiarism Checker
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-900">
				{features.map((feature: Feature, index: number) => (
					<div
						key={index}
						className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
					>
						<svg
							className="h-10 w-10 text-blue-600 mb-4"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d={feature.icon}
							></path>
						</svg>
						<h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
						<p className="text-gray-700">{feature.description}</p>
					</div>
				))}
			</div>
		</>
	);
};

export default FeaturesSection;
