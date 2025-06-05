import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";
import Snowing from "../../components/user_component/Snowing";

const Contact = () => {
	const [sent, setSent] = useState(false);
	const notificationRef = useRef<HTMLDivElement | null>(null);

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		setSent(true);

		setTimeout(() => {
			if (notificationRef.current) {
				notificationRef.current.scrollIntoView({ behavior: "smooth" });
			}
		}, 100);

		// Hide message after 3s
		setTimeout(() => setSent(false), 3000);
	};

	return (
		<div className="relative bg-[#f0f9ff] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
			<Snowing />

			{/* Animate only the content */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1 }}
				className="max-w-7xl mx-auto relative z-10"
			>
				<div className="max-w-7xl mx-auto relative z-10">
					{/* Success notification */}
					{sent && (
						<div
							ref={notificationRef}
							className="mb-6 w-full bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-md text-center shadow-sm transition-opacity duration-500"
						>
							🎉 Message sent successfully!
						</div>
					)}

					{/* Heading */}
					<div className="text-center mb-12">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">
							Contact Us
						</h1>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Have questions? We're here to help
						</p>
					</div>

					{/* Form and Info */}
					<div className="bg-white shadow-xl rounded-xl overflow-hidden">
						<div className="grid grid-cols-1 md:grid-cols-2">
							{/* Contact Form */}
							<div className="p-8 md:p-12">
								<h2 className="text-2xl font-bold text-gray-800 mb-6">
									Send us a message
								</h2>
								<form className="space-y-6" onSubmit={handleSubmit}>
									<div>
										<label
											htmlFor="name"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Your Name
										</label>
										<input
											type="text"
											id="name"
											required
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
											placeholder="John Doe"
										/>
									</div>
									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Email Address
										</label>
										<input
											type="email"
											id="email"
											required
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
											placeholder="you@example.com"
										/>
									</div>
									<div>
										<label
											htmlFor="subject"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Subject
										</label>
										<select
											id="subject"
											required
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
										>
											<option>General Inquiry</option>
											<option>Technical Support</option>
										</select>
									</div>
									<div>
										<label
											htmlFor="message"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Message
										</label>
										<textarea
											id="message"
											rows={4}
											required
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
											placeholder="Your message here..."
										></textarea>
									</div>
									<button
										type="submit"
										className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
									>
										Send Message
									</button>
								</form>
							</div>

							{/* Contact Info */}
							<div className="bg-gray-50 p-8 md:p-12">
								<h2 className="text-2xl font-bold text-gray-800 mb-6">
									Contact Information
								</h2>
								<div className="space-y-6">
									{/* Phone */}
									<div className="flex items-start">
										<div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
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
													d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
												/>
											</svg>
										</div>
										<div className="ml-4">
											<h3 className="text-lg font-medium text-gray-800">
												Phone
											</h3>
											<p className="text-gray-600">+977 9805872143</p>
											<p className="text-sm text-gray-500 mt-1">
												Monday-Friday, 9am-5pm
											</p>
										</div>
									</div>

									{/* Email */}
									<div className="flex items-start">
										<div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
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
													d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
												/>
											</svg>
										</div>
										<div className="ml-4">
											<h3 className="text-lg font-medium text-gray-800">
												Email
											</h3>
											<p className="text-gray-600">support@truetype.com</p>
											<p className="text-sm text-gray-500 mt-1">
												We typically reply within 24 hours
											</p>
										</div>
									</div>

									{/* Location */}
									<div className="flex items-start">
										<div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
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
													d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
												/>
											</svg>
										</div>
										<div className="ml-4">
											<h3 className="text-lg font-medium text-gray-800">
												Office
											</h3>
											<p className="text-gray-600">Balkhu</p>
											<p className="text-gray-600">Kathmandu</p>
											<p className="text-sm text-gray-500 mt-1">
												By appointment only
											</p>
										</div>
									</div>
								</div>

								{/* Socials */}
								<div className="mt-12">
									<h3 className="text-lg font-medium text-gray-800 mb-4">
										Follow Us
									</h3>
									<div className="flex space-x-4">
										<a
											href="#"
											className="bg-white p-3 rounded-full shadow hover:shadow-md"
										>
											<FaFacebookF className="w-5 h-5 text-blue-600" />
										</a>
										<a
											href="#"
											className="bg-white p-3 rounded-full shadow hover:shadow-md"
										>
											<FaTwitter className="w-5 h-5 text-blue-400" />
										</a>
										<a
											href="#"
											className="bg-white p-3 rounded-full shadow hover:shadow-md"
										>
											<FaLinkedinIn className="w-5 h-5 text-blue-700" />
										</a>
										<a
											href="#"
											className="bg-white p-3 rounded-full shadow hover:shadow-md"
										>
											<FaGithub className="w-5 h-5 text-gray-800" />
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default Contact;
