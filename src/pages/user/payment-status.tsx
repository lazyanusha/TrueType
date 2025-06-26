import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Snowing from "../../components/user_component/Snowing";

function useQuery() {
	const { search } = useLocation();
	return new URLSearchParams(search);
}

type PaymentData = {
	transaction_id: string;
	amount: number;
	currency: string;
	status: string;
	date: string;
	subscription_plan?: string;
	user_email?: string;
};

export default function PaymentStatus() {
	const query = useQuery();
	const navigate = useNavigate();

	const [status, setStatus] = useState<"pending" | "success" | "failed">(
		"pending"
	);
	const [message, setMessage] = useState<string>("Verifying payment...");
	const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
	const [retryCount, setRetryCount] = useState(0);

	const pidx = query.get("pidx");
	const transaction_id = query.get("transaction_id");

	const verifyPayment = async () => {
		setStatus("pending");
		setMessage("Verifying payment...");

		const token =
			localStorage.getItem("access_token") ||
			sessionStorage.getItem("access_token");

		if (!token) {
			setStatus("failed");
			setMessage("🔒 You must be logged in to verify payment.");
			return;
		}

		if (!pidx || !transaction_id) {
			setStatus("failed");
			setMessage("❌ Invalid payment response. Missing parameters.");
			return;
		}

		try {
			const res = await fetch("http://localhost:8000/payments/verify", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ pidx, transaction_id }),
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText || "Payment verification failed");
			}

			const data = await res.json();

			if (
				["Completed", "Already Confirmed", "Confirmed"].includes(data.status)
			) {
				setStatus("success");
				setMessage("✅ Payment successful! Thank you for subscribing.");
				setPaymentData({
					transaction_id: data.transaction_id || transaction_id,
					amount: data.amount / 100,
					currency: data.currency,
					status: data.status,
					date: new Date().toISOString(),
					subscription_plan: data.subscription_plan,
					user_email: data.user_email,
				});
			} else {
				setStatus("failed");
				setMessage("❌ Payment incomplete or could not be verified.");
			}
		} catch (err) {
			setStatus("failed");
			setMessage("⚠️ Payment verification failed. Please try again.");
		}
	};

	useEffect(() => {
		verifyPayment();
	}, [retryCount]);

	function formatDate(dateStr: string) {
		const d = new Date(dateStr);
		return isNaN(d.getTime())
			? "Invalid Date"
			: d.toLocaleString(undefined, {
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
			  });
	}

	function formatCurrency(amount: number) {
		return `Rs. ${amount.toLocaleString("en-NP")}`;
	}

	return (
		<div className="min-h-[80vh] bg-[#f0f9ff] flex items-center justify-center p-6 relative">
			<Snowing />
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className="w-full max-w-xl bg-white rounded-lg shadow-xl p-8"
			>
				{status === "pending" && (
					<div className="flex flex-col items-center text-center space-y-4">
						<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
						<p className="text-blue-600 font-medium">{message}</p>
					</div>
				)}

				{status === "failed" && (
					<div className="text-center space-y-4">
						<p className="text-red-600 font-semibold">{message}</p>
						<button
							onClick={() => setRetryCount((prev) => prev + 1)}
							className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded font-medium"
						>
							Retry Verification
						</button>
					</div>
				)}

				{status === "success" && paymentData && (
					<>
						<h1 className="text-2xl font-bold mb-2 text-center">
							Payment Receipt
						</h1>
						<p className="text-green-600 text-center mb-4">{message}</p>

						<div className="space-y-3 text-gray-800">
							<div>
								<h3 className="font-semibold">Transaction ID</h3>
								<p className="select-all">{paymentData.transaction_id}</p>
							</div>
							<div>
								<h3 className="font-semibold">Date</h3>
								<p>{formatDate(paymentData.date)}</p>
							</div>
							<div>
								<h3 className="font-semibold">Amount Paid</h3>
								<p>{formatCurrency(paymentData.amount)}</p>
							</div>
							<div>
								<h3 className="font-semibold">Status</h3>
								<p className="capitalize">{paymentData.status}</p>
							</div>
							{paymentData.subscription_plan && (
								<div>
									<h3 className="font-semibold">Subscription Plan</h3>
									<p>{paymentData.subscription_plan}</p>
								</div>
							)}
							{paymentData.user_email && (
								<div>
									<h3 className="font-semibold">User Email</h3>
									<p>{paymentData.user_email}</p>
								</div>
							)}
						</div>

						<button
							onClick={() => {
								navigate("/", { replace: true });
								window.location.reload();
							}}
							className="mt-6 w-full py-3 bg-[#3C5773] hover:bg-[#2c4055] text-white rounded font-semibold"
						>
							Back to Home Page
						</button>
					</>
				)}
			</motion.div>
		</div>
	);
}
