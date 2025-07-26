import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useAuth } from "../../utils/useAuth";

interface Props {
	loading: boolean;
	files: File[];
	text: string;
	wordCount: number;
	handleFilesSelected: (e: ChangeEvent<HTMLInputElement>) => void;
	handleTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
	handleCheckPlagiarism: () => Promise<void>;
	clearText: () => void;
	removeFile: (index: number) => void;
	elapsedTime: number;
}

const supportedExtensions = [".txt", ".pdf", ".docx"];
const MAX_TEXT_SUBMISSIONS = 5;
const MAX_FILE_UPLOADS = 5;
const MAX_WORDS = 1000;

const isSupportedFile = (fileName: string) =>
	supportedExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));

const countWords = (text: string) =>
	text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

const countSentences = (text: string) =>
	text
		.split(/[.!?]+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 5).length;

const resetCountsIfNewDay = () => {
	const todayStr = new Date().toISOString().slice(0, 10);
	const storedDate = localStorage.getItem("guest_last_reset_date");

	if (storedDate !== todayStr) {
		localStorage.setItem("guest_last_reset_date", todayStr);
		localStorage.setItem("textSubmissionsCount", "0");
		localStorage.setItem("fileUploadsCount", "0");
		return { text: 0, file: 0 };
	}

	return {
		text: parseInt(localStorage.getItem("textSubmissionsCount") || "0", 10),
		file: parseInt(localStorage.getItem("fileUploadsCount") || "0", 10),
	};
};

const FileUploadSection: React.FC<Props> = ({
	loading,
	files,
	text,
	wordCount,
	handleFilesSelected,
	handleTextChange,
	handleCheckPlagiarism,
	clearText,
	removeFile,
}) => {
	const { user } = useAuth();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [textSubmissionsCount, setTextSubmissionsCount] = useState(
		() => resetCountsIfNewDay().text
	);
	const [fileUploadsCount, setFileUploadsCount] = useState(
		() => resetCountsIfNewDay().file
	);

	useEffect(() => {
		const { text, file } = resetCountsIfNewDay();
		setTextSubmissionsCount(text);
		setFileUploadsCount(file);
	}, []);

	useEffect(() => {
		if (user) {
			// clear guest counts on login
			localStorage.removeItem("textSubmissionsCount");
			localStorage.removeItem("fileUploadsCount");
			localStorage.removeItem("guest_last_reset_date");
			setTextSubmissionsCount(0);
			setFileUploadsCount(0);
		}
	}, [user]);

	const hasEnoughSentences = countSentences(text) >= 10;
	const supportedFiles = files.filter((file) => isSupportedFile(file.name));

	// Separate limit flags
	const textLimitReached =
		!user && textSubmissionsCount >= MAX_TEXT_SUBMISSIONS;
	const fileLimitReached = !user && fileUploadsCount >= MAX_FILE_UPLOADS;

	// Disable file upload if loading or file limit reached or text is entered
	const disableFileUpload =
		loading || fileLimitReached || text.trim().length > 0;

	// Disable text area if loading or text limit reached or files uploaded
	const disableTextArea =
		loading || textLimitReached || supportedFiles.length > 0;

	const handleFileUploadClick = () => {
		if (disableFileUpload) {
			alert(
				fileLimitReached
					? `File upload limit (${MAX_FILE_UPLOADS}) reached. Please log in for unlimited access.`
					: "You can only use either text input or file upload at a time."
			);
			return;
		}
		fileInputRef.current?.click();
	};

	const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		if (!selectedFiles.length) return;

		// Extension validation
		const unsupported = selectedFiles.filter(
			(file) => !isSupportedFile(file.name)
		);
		if (unsupported.length) {
			alert(
				`Unsupported file types: ${unsupported.map((f) => f.name).join(", ")}`
			);
			e.target.value = "";
			return;
		}

		if (text.trim()) {
			alert("You can only use either text input or file upload at a time.");
			e.target.value = "";
			return;
		}

		if (!user) {
			if (fileUploadsCount + selectedFiles.length >= MAX_FILE_UPLOADS) {
				alert(
					`Daily upload limit reached (${MAX_FILE_UPLOADS} files). Please log in for unlimited uploads.`
				);
				e.target.value = "";
				return;
			}

			const txtFiles = selectedFiles.filter((f) =>
				f.name.toLowerCase().endsWith(".txt")
			);

			if (txtFiles.length > 0) {
				try {
					const texts = await Promise.all(
						txtFiles.map(
							(file) =>
								new Promise<string>((resolve, reject) => {
									const reader = new FileReader();
									reader.onload = () =>
										resolve((reader.result as string) || "");
									reader.onerror = () => reject();
									reader.readAsText(file);
								})
						)
					);

					const totalWords = texts.reduce((sum, t) => sum + countWords(t), 0);

					if (totalWords > MAX_WORDS) {
						alert(
							"Uploaded .txt files exceed the 1000-word limit. Please log in to continue."
						);
						e.target.value = "";
						return;
					}
				} catch {
					alert("Failed to read one or more files.");
					e.target.value = "";
					return;
				}
			} else {
				alert("Please log in to upload PDF or DOCX files.");
				e.target.value = "";
				return;
			}

			setFileUploadsCount((prev) => {
				const updated = prev + selectedFiles.length;
				localStorage.setItem(
					"guest_last_reset_date",
					new Date().toISOString().slice(0, 10)
				);
				localStorage.setItem("fileUploadsCount", updated.toString());
				return updated;
			});
		}

		handleFilesSelected(e);
		e.target.value = "";
	};

	const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const newWordCount = countWords(e.target.value);

		if (!user && newWordCount > MAX_WORDS) {
			alert("Text exceeds 1000 words. Please log in for extended limits.");
			return;
		}

		if (supportedFiles.length > 0) {
			alert("Remove uploaded files before entering text.");
			return;
		}

		if (textLimitReached) {
			alert(
				`Daily text submission limit (${MAX_TEXT_SUBMISSIONS}) reached. Please log in for unlimited access.`
			);
			return;
		}

		handleTextChange(e);
	};

	const onCheckClick = async () => {
		if (!user) {
			if (wordCount > MAX_WORDS) {
				alert("You've exceeded the 1000-word limit.");
				return;
			}
			if (textLimitReached) {
				alert("Daily guest text submission limit reached.");
				return;
			}
			if (fileLimitReached) {
				alert("Daily guest upload limit reached.");
				return;
			}
		}

		if (!hasEnoughSentences && text.trim() && supportedFiles.length === 0) {
			alert("Please enter at least 10 meaningful sentences.");
			return;
		}

		if (!user) {
			const updated = textSubmissionsCount + 1;
			localStorage.setItem(
				"guest_last_reset_date",
				new Date().toISOString().slice(0, 10)
			);
			localStorage.setItem("textSubmissionsCount", updated.toString());
			setTextSubmissionsCount(updated);
		}

		await handleCheckPlagiarism();
	};

	const wordColorClass =
		!user && wordCount > MAX_WORDS ? "text-red-600 font-bold" : "text-gray-700";

	return (
		<section className="bg-white rounded-xl p-8 shadow-xl mb-12 text-gray-900 relative">
			{/* Upload Box */}
			<div
				className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
					disableFileUpload
						? "opacity-50 cursor-not-allowed border-gray-300"
						: "hover:border-blue-500 border-gray-300"
				}`}
				onClick={handleFileUploadClick}
			>
				<p className="text-lg font-semibold">Click to upload files</p>
				<p className="text-sm text-gray-600 mt-1">Supports .txt, .pdf, .docx</p>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					className="hidden"
					onChange={onFileChange}
					disabled={disableFileUpload}
					accept={supportedExtensions.join(",")}
				/>
			</div>

			{/* Text Area */}
			{!textLimitReached && (
				<div className="relative mt-6">
					<textarea
						className="w-full h-48 border border-gray-300 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Paste your text here to check for plagiarism..."
						value={text}
						onChange={onTextChange}
						disabled={disableTextArea}
					/>
					{text && (
						<button
							onClick={clearText}
							className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full w-7 h-7 flex items-center justify-center text-gray-700"
							aria-label="Clear text"
							title="Clear text"
							disabled={loading}
						>
							&times;
						</button>
					)}
					{!hasEnoughSentences && text.trim() !== "" && (
						<p className="mt-1 text-sm text-red-600">
							Please enter at least 10 meaningful sentences.
						</p>
					)}
				</div>
			)}

			{/* Uploaded File List */}
			{supportedFiles.length > 0 && (
				<div className="mt-4 text-sm text-gray-700 space-y-1">
					<p>Uploaded files:</p>
					<ul>
						{supportedFiles.map((file, i) => (
							<li
								key={i}
								className="flex items-center justify-between border border-gray-300 rounded px-3 py-1"
							>
								<span>{file.name}</span>
								<button
									type="button"
									onClick={() => removeFile(i)}
									className="text-red-700 hover:text-red-800 font-bold ml-3"
									aria-label={`Remove file ${file.name}`}
									disabled={loading}
								>
									&times;
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Check Button & Word Counter */}
			<div className="mt-4 flex justify-between items-center overflow-hidden">
				<span className={`text-sm ${wordColorClass}`}>
					Words: {wordCount} / {MAX_WORDS}
				</span>
				<button
					onClick={onCheckClick}
					disabled={
						loading ||
						(textLimitReached && supportedFiles.length === 0) ||
						(fileLimitReached && text.trim() === "")
					}
					className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading && (
						<svg
							className="animate-spin h-5 w-5 mr-2 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v8H4z"
							></path>
						</svg>
					)}
					Check Plagiarism
				</button>
			</div>

			{/* Guest Warning */}
			{!user && (
				<div className="mt-4 text-xs text-red-500">
					<p>
						Guest limits: Up to 5 submissions including both text submissions
						and file uploads per day. Max 1000 words per submission.
					</p>
					<p>Please log in for unlimited access.</p>
				</div>
			)}
		</section>
	);
};

export default FileUploadSection;
