// FileUtils.ts

import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

// -----------------------------
// Section 1: TXT
// -----------------------------
export async function extractTxt(file: File): Promise<string> {
	return await file.text();
}

// -----------------------------
// Section 2: PDF with OCR fallback
// -----------------------------
export async function extractPdf(
	file: File,
	useOCR: boolean = true
): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

	let fullText = "";

	let worker: any = null;
	if (useOCR) {
		worker = createWorker();
		 await worker.load();
		await worker.loadLanguage("eng");
		await worker.initialize("eng");
	}

	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();
		const pageText = content.items
			.map((item: any) => item.str)
			.join(" ")
			.trim();

		if (pageText.length > 10) {
			fullText += pageText + "\n";
		} else if (useOCR && worker) {
			const viewport = page.getViewport({ scale: 2.0 });
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d")!;
			canvas.width = viewport.width;
			canvas.height = viewport.height;

			await page.render({ canvasContext: context, viewport }).promise;
			const {
				data: { text: ocrText },
			} = await (await worker).recognize(canvas);
			fullText += ocrText + "\n";
		}
	}

	if (worker) {
		await (await worker).terminate();
	}

	return fullText.trim();
}

// -----------------------------
// Section 3: DOCX
// -----------------------------
export async function extractDocx(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const result = await mammoth.extractRawText({ arrayBuffer });
	return result.value;
}

// -----------------------------
// Section 4: Dispatcher
// -----------------------------
export async function extractTextFromFile(file: File): Promise<string> {
	const ext = file.name.split(".").pop()?.toLowerCase();

	if (ext === "txt") {
		return await extractTxt(file);
	} else if (ext === "pdf") {
		return await extractPdf(file, true); // OCR enabled
	} else if (ext === "docx") {
		return await extractDocx(file);
	} else {
		throw new Error("Unsupported file type");
	}
}

// -----------------------------
// Section 5: Convert Text to .txt File
// -----------------------------
export function textToFile(text: string): File {
	const blob = new Blob([text], { type: "text/plain" });
	return new File([blob], "submitted-text.txt", { type: "text/plain" });
}
