import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export async function handleDownloadPDF(
	sectionId: string,
	options: {
		title?: string;
		timestamp?: string;
		duration?: string;
		exactScore?: number;
		partialScore?: number;
		uniqueScore?: number;
		wordCount?: number;
		charCount?: number;
		matchedSources?: string[];
		logoUrl?: string;
	} = {}
): Promise<void> {
	console.log("PDF download started");

	const element = document.getElementById(sectionId);
	if (!element) {
		console.error(`Element with id '${sectionId}' not found.`);
		alert("Sorry, could not find the content to export.");
		return;
	}

	// Clone the entire section
	const clonedElement = element.cloneNode(true) as HTMLElement;

	// Clear cloned content and build simplified report container
	clonedElement.innerHTML = ""; // wipe all content

	// Create container div for report
	const container = document.createElement("div");
	container.style.fontFamily = "'Helvetica', 'Arial', sans-serif";
	container.style.color = "#222";
	container.style.padding = "20px";
	container.style.width = "100%";

	// Add logo if provided
	if (options.logoUrl) {
		const logoImg = document.createElement("img");
		logoImg.src = options.logoUrl;
		logoImg.style.maxWidth = "150px";
		logoImg.style.marginBottom = "20px";
		container.appendChild(logoImg);
	}

	// Title
	const title = document.createElement("h2");
	title.textContent = options.title || "Plagiarism Scan Report";
	title.style.textAlign = "center";
	title.style.marginBottom = "25px";
	container.appendChild(title);

	// Date and time scanned
	if (options.timestamp) {
		const scannedOn = document.createElement("p");
		scannedOn.textContent = `Scanned on: ${options.timestamp}`;
		scannedOn.style.textAlign = "center";
		scannedOn.style.marginBottom = "15px";
		container.appendChild(scannedOn);
	}

	// Table for scores: Exact, Partial, Unique
	const scoreTable = document.createElement("table");
	scoreTable.style.width = "100%";
	scoreTable.style.borderCollapse = "collapse";
	scoreTable.style.marginBottom = "25px";

	// Table header row
	const headerRow = document.createElement("tr");
	["Type", "Percentage"].forEach((text) => {
		const th = document.createElement("th");
		th.textContent = text;
		th.style.borderBottom = "2px solid #444";
		th.style.padding = "10px";
		th.style.textAlign = "left";
		th.style.fontWeight = "bold";
		headerRow.appendChild(th);
	});
	scoreTable.appendChild(headerRow);

	// Helper to create a row
	function addRow(type: string, percent?: number, color?: string) {
		const tr = document.createElement("tr");

		const tdType = document.createElement("td");
		tdType.textContent = type;
		tdType.style.padding = "10px";
		tdType.style.borderBottom = "1px solid #ddd";
		tdType.style.color = color || "#000";

		const tdPercent = document.createElement("td");
		tdPercent.textContent = percent !== undefined ? `${percent}%` : "-";
		tdPercent.style.padding = "10px";
		tdPercent.style.borderBottom = "1px solid #ddd";
		tdPercent.style.color = color || "#000";

		tr.appendChild(tdType);
		tr.appendChild(tdPercent);
		scoreTable.appendChild(tr);
	}

	addRow("Exact Match", options.exactScore, "#dc2626"); // red
	addRow("Partial Match", options.partialScore, "#ca8a04"); // yellow/orange
	addRow("Unique", options.uniqueScore, "#16a34a"); // green

	container.appendChild(scoreTable);

	// Word count and character count
	const wcCcDiv = document.createElement("p");
	wcCcDiv.style.textAlign = "center";
	wcCcDiv.style.marginBottom = "25px";
	wcCcDiv.textContent = `Words: ${options.wordCount ?? "-"} | Characters: ${
		options.charCount ?? "-"
	}`;
	container.appendChild(wcCcDiv);

	// Time taken to scan
	if (options.duration) {
		const durationP = document.createElement("p");
		durationP.style.textAlign = "center";
		durationP.style.marginBottom = "25px";
		durationP.textContent = `Time Taken to Scan: ${options.duration}`;
		container.appendChild(durationP);
	}

	// Matched sources list heading
	const sourcesHeading = document.createElement("h3");
	sourcesHeading.textContent = `Matched Sources (${
		options.matchedSources?.length ?? 0
	})`;
	sourcesHeading.style.marginBottom = "15px";
	container.appendChild(sourcesHeading);

	// Matched sources list
	if (options.matchedSources && options.matchedSources.length > 0) {
		const sourcesList = document.createElement("ul");
		sourcesList.style.paddingLeft = "20px";
		options.matchedSources.forEach((src) => {
			const li = document.createElement("li");
			li.textContent = src;
			li.style.marginBottom = "5px";
			sourcesList.appendChild(li);
		});
		container.appendChild(sourcesList);
	} else {
		const noSources = document.createElement("p");
		noSources.textContent = "No matched sources found.";
		noSources.style.fontStyle = "italic";
		noSources.style.textAlign = "center";
		container.appendChild(noSources);
	}

	// Append the container to cloned element
	clonedElement.appendChild(container);

	// Hide cloned element offscreen for rendering
	clonedElement.style.position = "fixed";
	clonedElement.style.left = "-9999px";
	clonedElement.style.top = "0";
	clonedElement.style.zIndex = "-1";

	document.body.appendChild(clonedElement);

	try {
		const canvas = await html2canvas(clonedElement, {
			scale: 2,
			useCORS: true,
			logging: false,
			backgroundColor: "#ffffff", // white background
		});

		document.body.removeChild(clonedElement);

		const imgData = canvas.toDataURL("image/png");

		const pdf = new jsPDF({
			unit: "pt",
			format: "a4",
		});

		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

		pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

		const filename = `${
			options.title || "Report"
		} - ${new Date().toLocaleString()}.pdf`;
		pdf.save(filename);

		alert("✅ PDF generated and downloaded successfully!");
	} catch (err) {
		console.error("❌ PDF generation error:", err);
		alert("An error occurred while generating the PDF. Please try again.");

		if (document.body.contains(clonedElement)) {
			document.body.removeChild(clonedElement);
		}
	}
}
