import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import ConfettiEffect from "./ConfettieEffect";
import { useAuth } from "../../utils/useAuth";

interface FileUploadSectionProps {
	loading: boolean;
	files: File[];
	text: string;
	wordCount: number;
	extractedTexts?: Record<string, string>;
	handleFilesSelected: (e: ChangeEvent<HTMLInputElement>) => void;
	handleTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
	handleCheckPlagiarism: () => void;
	clearText: () => void;
	removeFile: (index: number) => void;
}

const supportedExtensions = [".txt", ".pdf", ".docx"];

const isSupportedFile = (fileName: string) => {
	const lower = fileName.toLowerCase();
	return supportedExtensions.some((ext) => lower.endsWith(ext));
};

const countSentences = (text: string) => {
	return text
		.split(/[.!?]+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 5).length;
};

const countWords = (text: string) => {
	return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
};

const MAX_TEXT_SUBMISSIONS = 5;
const MAX_FILE_UPLOADS = 5;
const MAX_UPLOADS = MAX_TEXT_SUBMISSIONS + MAX_FILE_UPLOADS;
const MAX_WORDS = 1000;

const resetCountsIfNewDay = () => {
	const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
	const storedDate = localStorage.getItem("guest_last_reset_date");

	if (storedDate !== todayStr) {
		// New day → reset counters and update date
		localStorage.setItem("guest_last_reset_date", todayStr);
		localStorage.setItem("textSubmissionsCount", "0");
		localStorage.setItem("fileUploadsCount", "0");
		return { text: 0, file: 0 };
	}

	// Same day: return current stored values
	return {
		text: parseInt(localStorage.getItem("textSubmissionsCount") || "0", 10),
		file: parseInt(localStorage.getItem("fileUploadsCount") || "0", 10),
	};
};

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
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

	const [textSubmissionsCount, setTextSubmissionsCount] = useState(() => {
		return resetCountsIfNewDay().text;
	});
	const [fileUploadsCount, setFileUploadsCount] = useState(() => {
		return resetCountsIfNewDay().file;
	});

	useEffect(() => {
		const counts = resetCountsIfNewDay();
		setTextSubmissionsCount(counts.text);
		setFileUploadsCount(counts.file);
	}, []);

	useEffect(() => {
		if (user) {
			localStorage.removeItem("textSubmissionsCount");
			localStorage.removeItem("fileUploadsCount");
			localStorage.removeItem("guest_last_reset_date");
			setTextSubmissionsCount(0);
			setFileUploadsCount(0);
		}
	}, [user]);

	const nonUserExceededLimit =
		!user &&
		(textSubmissionsCount >= MAX_TEXT_SUBMISSIONS ||
			fileUploadsCount >= MAX_FILE_UPLOADS);

	const supportedFiles = files.filter((file) => isSupportedFile(file.name));
	const showInputSections = !nonUserExceededLimit;
	const hasEnoughSentences = countSentences(text) >= 10;
	const [showConfetti, setShowConfetti] = useState(false);

	const handleFileUpload = () => {
		if (loading || nonUserExceededLimit) {
			if (nonUserExceededLimit) {
				alert(
					`Guest upload limit reached for today (${MAX_UPLOADS} files). Please log in to upload more files.`
				);
			}
			return;
		}
		if (text.trim()) {
			alert("You can only use either text input or file upload at a time.");
			return;
		}
		fileInputRef.current?.click();
	};

	const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;

		const selectedFiles = Array.from(e.target.files);
		const unsupportedFiles = selectedFiles.filter(
			(file) => !isSupportedFile(file.name)
		);

		if (unsupportedFiles.length > 0) {
			alert(
				`Unsupported file types: ${unsupportedFiles
					.map((f) => f.name)
					.join(", ")}`
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
			if (fileUploadsCount >= MAX_FILE_UPLOADS) {
				alert(
					`Guest upload limit reached for today (${MAX_UPLOADS} files or texts). Please log in to upload more files.`
				);
				e.target.value = "";
				return;
			}

			if (fileUploadsCount + selectedFiles.length > MAX_FILE_UPLOADS) {
				alert(
					`Uploading these files will exceed your daily guest upload limit (${MAX_UPLOADS} files or texts). Please log in to get unlimited access.`
				);
				e.target.value = "";
				return;
			}

			const txtFiles = selectedFiles.filter((f) =>
				f.name.toLowerCase().endsWith(".txt")
			);

			if (txtFiles.length > 0) {
				Promise.all(
					txtFiles.map(
						(file) =>
							new Promise<string>((resolve, reject) => {
								const reader = new FileReader();
								reader.onload = () => resolve(reader.result as string);
								reader.onerror = () => reject("Failed to read file");
								reader.readAsText(file);
							})
					)
				)
					.then((texts) => {
						const totalWords = texts.reduce(
							(sum, text) => sum + countWords(text),
							0
						);
						if (totalWords > MAX_WORDS) {
							alert(
								"Total words in uploaded .txt files exceed 1000 words limit. Please log in to upload larger files."
							);
							e.target.value = "";
							return;
						}

						setFileUploadsCount((prev) => {
							const updated = prev + selectedFiles.length;
							const todayStr = new Date().toISOString().slice(0, 10);
							localStorage.setItem("guest_last_reset_date", todayStr);
							localStorage.setItem("fileUploadsCount", String(updated));
							return updated;
						});

						handleFilesSelected(e);
						e.target.value = ""; // ✅ Clear file input to allow re-upload
					})
					.catch(() => {
						alert("Error reading files. Please try again.");
						e.target.value = "";
					});

				return;
			} else {
				alert("Please log in to upload PDF or DOCX files.");
				e.target.value = "";
				return;
			}
		}

		// ✅ For logged-in users
		handleFilesSelected(e);
		e.target.value = ""; // ✅ Clear file input to allow re-upload
	};

	const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const newText = e.target.value;
		const newWordCount = countWords(newText);

		if (!user && newWordCount > MAX_WORDS) {
			alert(
				"You've exceeded the 1000-word limit for text input. Please log in to check longer texts."
			);
			return;
		}
		if (supportedFiles.length > 0) {
			alert("File upload disabled. Please remove files to enter text.");
			return;
		}

		handleTextChange(e);
	};

	const onCheckPlagiarism = () => {
		if (!user) {
			if (wordCount > MAX_WORDS) {
				alert(
					"You've exceeded the 1000-word limit. Please log in to check longer texts."
				);
				return;
			}
			if (textSubmissionsCount >= MAX_TEXT_SUBMISSIONS) {
				alert(
					`Guest text submission limit reached for today (${MAX_UPLOADS} submissions or files). Please log in to continue checking text.`
				);
				return;
			}
			if (fileUploadsCount >= MAX_FILE_UPLOADS) {
				alert(
					`Guest upload limit reached for today (${MAX_UPLOADS} files or texts). Please log in to get unlimited access.`
				);
				return;
			}
		}

		if (
			!hasEnoughSentences &&
			text.trim() !== "" &&
			supportedFiles.length === 0
		) {
			alert(
				"Please enter at least 10 meaningful sentences for plagiarism checking."
			);
			return;
		}

		if (!user) {
			setTextSubmissionsCount((prev) => {
				const updated = prev + 1;
				const todayStr = new Date().toISOString().slice(0, 10);
				localStorage.setItem("guest_last_reset_date", todayStr);
				localStorage.setItem("textSubmissionsCount", String(updated));
				return updated;
			});
		}
		setShowConfetti(true);
		setTimeout(() => setShowConfetti(false), 5000);
		handleCheckPlagiarism();
	};

	return (
		<section className="bg-white rounded-xl p-8 shadow-xl mb-12 text-gray-900 relative">
			<div
				className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-blue-500 ${
					loading || nonUserExceededLimit
						? "opacity-50 cursor-not-allowed"
						: "border-gray-300"
				}`}
				onClick={handleFileUpload}
			>
				<p className="text-lg font-semibold">Click to upload files</p>
				<p className="text-sm text-gray-600 mt-1">
					Supports multiple files (.txt, .pdf, .docx)
				</p>
				<input
					ref={fileInputRef}
					type="file"
					className="hidden"
					multiple
					onChange={onFileChange}
					disabled={loading || !!text.trim() || nonUserExceededLimit}
					accept={supportedExtensions.join(",")}
				/>
			</div>

			{showInputSections && (
				<>
					<div className="relative mt-6">
						<textarea
							className="w-full h-48 border border-gray-300 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Paste your text here to check for plagiarism..."
							value={text}
							onChange={onTextChange}
							disabled={loading || supportedFiles.length > 0}
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
								Please enter at least 10 meaningful sentences for plagiarism
								checking.
							</p>
						)}
					</div>

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
				</>
			)}

			<div className="mt-4 flex justify-between items-center">
				<span
					className={`text-sm ${
						wordCount > MAX_WORDS ? "text-red-600 font-bold" : "text-gray-700"
					}`}
				>
					Words: {wordCount} / {MAX_WORDS}
				</span>

				<button
					onClick={onCheckPlagiarism}
					disabled={
						loading ||
						nonUserExceededLimit ||
						(!hasEnoughSentences &&
							text.trim() !== "" &&
							supportedFiles.length === 0)
					}
					className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
					title={
						nonUserExceededLimit
							? "Guest upload/text submission limit reached. Please log in."
							: !hasEnoughSentences &&
							  text.trim() !== "" &&
							  supportedFiles.length === 0
							? "Enter at least 10 meaningful sentences."
							: undefined
					}
				>
					{loading ? (
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
					) : null}
					Check Plagiarism
				</button>
			</div>

			{!user && (
				<div className="mt-4 text-xs text-red-500">
					<p>
						Guest limits: Up to {MAX_UPLOADS} text submissions or file uploads
						per day (max 1000 words per submission).
					</p>
					<p>Please log in for unlimited access and more features.</p>
				</div>
			)}

			<ConfettiEffect active={showConfetti} />
		</section>
	);
};

export default FileUploadSection;
