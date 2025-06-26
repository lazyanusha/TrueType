import { useEffect, useState } from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

type UsageData = {
	period: string; // ISO string date truncated to day/week/month/year
	count: number;
};

export default function SystemUsage() {
	const token =
		localStorage.getItem("access_token") ||
		sessionStorage.getItem("access_token");

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [usageData, setUsageData] = useState<UsageData[]>([]);
	const [period, setPeriod] = useState<"day" | "week" | "month" | "year">(
		"month"
	);
	const [startDate, setStartDate] = useState<string | "">("");
	const [endDate, setEndDate] = useState<string | "">("");

	// Format X axis labels depending on period
	const formatXAxis = (isoDate: string) => {
		const date = new Date(isoDate);
		switch (period) {
			case "day":
				return date.toLocaleDateString(undefined, {
					year: "numeric",
					month: "short",
					day: "numeric",
				});
			case "week":
				// Show e.g. "W15 2025"
				const onejan = new Date(date.getFullYear(), 0, 1);
				const weekNum = Math.ceil(
					((date.getTime() - onejan.getTime()) / 86400000 +
						onejan.getDay() +
						1) /
						7
				);
				return `W${weekNum} ${date.getFullYear()}`;
			case "month":
				return date.toLocaleDateString(undefined, {
					year: "numeric",
					month: "short",
				});
			case "year":
				return date.getFullYear().toString();
			default:
				return isoDate;
		}
	};

	// Format tooltip label nicely
	const formatTooltipLabel = (isoDate: string) => {
		const date = new Date(isoDate);
		switch (period) {
			case "week":
				return `${formatXAxis(isoDate)}`;
			default:
				return date.toLocaleDateString();
		}
	};

	useEffect(() => {
		const fetchUsage = async () => {
			setLoading(true);
			setError(null);
			try {
				const params = new URLSearchParams({ period });

				if (startDate) params.append("start_date", startDate);
				if (endDate) params.append("end_date", endDate);

				const res = await fetch(
					`http://localhost:8000/reports/usage?${params.toString()}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!res.ok) throw new Error(`Error: ${res.status}`);

				const data = await res.json();
				if (!data.success) throw new Error(data.error || "API error");

				setUsageData(data.data);
			} catch (err: any) {
				setError(err.message || "Something went wrong.");
			} finally {
				setLoading(false);
			}
		};

		fetchUsage();
	}, [period, startDate, endDate, token]);

	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-[#3C5773]">
				Reports Generated Over Time
			</h2>

			<div className="flex flex-wrap gap-4 mb-6 items-center">
				<div>
					<label htmlFor="period-select" className="mr-2 font-semibold">
						Select Period:
					</label>
					<select
						id="period-select"
						value={period}
						onChange={(e) => setPeriod(e.target.value as any)}
						className="border rounded px-2 py-1"
					>
						<option value="day">Daily</option>
						<option value="week">Weekly</option>
						<option value="month">Monthly</option>
						<option value="year">Yearly</option>
					</select>
				</div>

				<div>
					<label htmlFor="start-date" className="mr-2 font-semibold">
						Start Date:
					</label>
					<input
						id="start-date"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="border rounded px-2 py-1"
						max={endDate || undefined}
					/>
				</div>

				<div>
					<label htmlFor="end-date" className="mr-2 font-semibold">
						End Date:
					</label>
					<input
						id="end-date"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="border rounded px-2 py-1"
						min={startDate || undefined}
						max={new Date().toISOString().slice(0, 10)} // today
					/>
				</div>
			</div>

			{loading && <p>Loading usage data...</p>}

			{error && (
				<p className="text-red-600 mb-4">Error fetching usage data: {error}</p>
			)}

			{!loading && !error && usageData.length === 0 && (
				<p>No usage data found for the selected period.</p>
			)}

			{!loading && !error && usageData.length > 0 && (
				<div style={{ width: "100%", height: 300 }}>
					<ResponsiveContainer>
						<AreaChart data={usageData}>
							<XAxis
								dataKey="period"
								tickFormatter={formatXAxis}
								minTickGap={15}
							/>
							<YAxis allowDecimals={false} />
							<Tooltip labelFormatter={formatTooltipLabel} />
							<Area
								type="monotone"
								dataKey="count"
								stroke="#3C5773"
								fill="#CBD5E1"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			)}
		</section>
	);
}
