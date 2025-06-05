import { useNavigate, useLocation } from "react-router-dom";
import Snowing from "../components/Snowing";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Plan {
	name: string;
	price: string;
	features: string[];
}

interface User {
	id: number;
	full_name: string;
	email: string;
	subscription_status?: string;
}

export default function PaymentPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const fromRegister = location.state?.fromRegister;
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Fetch user data on mount
	useEffect(() => {
		if (fromRegister) {
			alert("Registration successful! Choose a subscription plan to continue.");
		}

		const fetchUser = async () => {
			const token =
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token");

			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("http://localhost:8000/users/me", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					mode: "cors",
				});

				if (!response.ok) throw new Error("Failed to fetch user");
				setUser(await response.json());
			} catch (error) {
				console.error("User fetch error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [fromRegister]);

	const subscriptionPlans: Plan[] = [
		{
			name: "Weekly",
			price: "200",
			features: [
				"7-day access",
				"Unlimited Reports",
				"Multiple File Uploads",
				"Basic Citations Check",
			],
		},
		{
			name: "Monthly",
			price: "700",
			features: [
				"30-day access",
				"Unlimited Reports",
				"Multiple File Uploads",
				"Advanced Citations Check",
				"Priority Support",
			],
		},
		{
			name: "Yearly",
			price: "1450",
			features: [
				"1-year access",
				"Unlimited Reports",
				"Multiple File Uploads",
				"Premium Citations Check",
				"Reports Export",
				"24/7 Priority Support",
				"Save 45%",
			],
		},
	];

	const handleSelectPlan = async (
		planName: string,
		amount: string, // Rs (string)
		user: User
	) => {
		const amountInPaisa = parseInt(amount) * 100; // convert to paisa

		const payload = {
			plan_name: planName,
			amount: amountInPaisa,
			user_id: user.id,
			full_name: user.full_name,
			email: user.email,
			phone: "9800000001", // Replace with user's real phone if available
		};

		try {
			const response = await fetch(
				"http://localhost:8000/khalti/create-payment",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				}
			);

			if (!response.ok) {
				const errorData = await response.text();
				alert(`Payment initiation failed: ${response.status}: ${errorData}`);
				return;
			}

			const resData = await response.json();
			if (resData.payment_url) {
				window.location.href = resData.payment_url; // redirect to Khalti
			} else {
				alert("Payment initiation failed. No payment URL received.");
			}
		} catch (error) {
			console.error("Payment initiation error:", error);
			alert("Something went wrong during payment initiation.");
		}
	};

	if (loading) {
		return (
			<div className="text-center mt-20 text-gray-600">
				Loading user info...
			</div>
		);
	}

	if (!user) {
		return (
			<div className="text-center text-red-600 text-lg font-semibold mt-20">
				You must be logged in first to view plans.
				<br />
				<button
					onClick={() => navigate("/login")}
					className="mt-4 underline text-blue-600"
				>
					Go to Login
				</button>
			</div>
		);
	}

	return (
		<div className="min-h-[60vh] bg-[#f0f9ff] flex flex-col justify-center items-center pt-30 px-6 sm:px-10 lg:px-16">
			<Snowing />
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1 }}
				className="w-7xl"
			>
				<>
					<h1 className="text-4xl font-extrabold text-[#3C5773] mb-4 text-center">
						Welcome, {user.full_name}!
					</h1>
					<h2 className="text-xl text-center mb-8 text-[#3C5773]">
						Choose a Subscription Plan:
					</h2>
					<div className="grid gap-10 sm:grid-cols-1 md:grid-cols-3 max-w-7xl w-full">
						{subscriptionPlans.map((plan) => (
							<div
								key={plan.name}
								className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
							>
								<div className="p-8 flex flex-col flex-grow">
									<div className="flex justify-between items-center mb-6">
										<h2 className="text-2xl font-semibold text-gray-900">
											{plan.name}
										</h2>
										<span className="text-xl font-semibold text-blue-600">
											Rs {plan.price}
										</span>
									</div>
									<ul className="flex flex-col gap-3 text-gray-600 text-sm mb-auto">
										{plan.features.map((feature, index) => (
											<li
												key={index}
												className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0"
											>
												{feature}
											</li>
										))}
									</ul>
								</div>
								<button
									onClick={() => handleSelectPlan(plan.name, plan.price, user)}
									style={{ borderColor: "#3C5773", color: "#3C5773" }}
									className="self-start ml-4 py-2 rounded-[10px] border-1 w-64 mb-8 font-semibold text-lg hover:bg-[#eee] transition-colors duration-300 shadow-sm hover:shadow-md"
								>
									Select Plan
								</button>
							</div>
						))}
					</div>
				</>
			</motion.div>
		</div>
	);
}
