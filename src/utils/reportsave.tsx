import type { resultTypes } from "../components/publilc/types/resultTypes";

export async function saveReportToDB(result: resultTypes, token: string) {
	const payload = {
		submitted_document: result.submittedDocument,
		unique_score: result.unique_score,
		total_exact_score: result.total_exact_score,
		total_partial_score: result.total_partial_score,
		words: result.scanProperties.words || 0,
		characters: result.scanProperties.characters || 0,
		citation_status: result.scanProperties.citationStatus || "Uncited",
	};

	console.log("📦 Payload to save:", payload);
	console.log("🔐 Using token:", token);

	try {
		const res = await fetch("http://localhost:8000/reports", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		});

		const resText = await res.text();
		console.log("📨 Server response:", res.status, resText);

		let data;
		try {
			data = JSON.parse(resText);
		} catch {
			data = null;
		}

		if (!res.ok) throw new Error(data?.detail || "Failed to upload report");

		return {
			success: true,
			message: data?.message,
			report_id: data?.report_id,
		};
	} catch (error: any) {
		console.error("❌ Error while saving report:", error.message);
		return {
			success: false,
			message: error.message || "Unexpected error while saving report.",
		};
	}
}
