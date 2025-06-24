import { useState, type ChangeEvent } from "react";
import { extractTextFromFile } from "../../../utils/FileUtils";
import FileUploadSection from "../../user_component/FileUploadSection";

interface Props {
	onCheck: (file: File) => void;
	onShowResults?: () => void;
	loading?: boolean;
	elapsedTime: number;
}

const FileUploadHandle = ({
	onCheck,
	onShowResults,
	loading = false,
	elapsedTime,
}: Props) => {
	const [files, setFiles] = useState<File[]>([]);
	const [fileTexts, setFileTexts] = useState<Record<string, string>>({});
	const [manualText, setManualText] = useState("");

	const countWords = (text: string) =>
		text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

	const getCombinedText = () =>
		[...Object.values(fileTexts), manualText].filter(Boolean).join("\n\n");

	const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;

		const selectedFiles = Array.from(e.target.files);
		const updatedFileTexts: Record<string, string> = {};
		const validFiles: File[] = [];

		for (const file of selectedFiles) {
			try {
				const text = await extractTextFromFile(file);
				updatedFileTexts[file.name] = text;
				validFiles.push(file);
			} catch (err) {
				console.error("Failed to extract text:", err);
				alert(`${file.name} was skipped due to format or readability issues.`);
			}
		}

		setFiles((prev) => [...prev, ...validFiles]);
		setFileTexts((prev) => ({ ...prev, ...updatedFileTexts }));
	};

	const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setManualText(e.target.value);
	};

	const removeFile = (index: number) => {
		setFiles((prev) => {
			const updated = [...prev];
			const removed = updated.splice(index, 1)[0];
			setFileTexts((prevTexts) => {
				const updatedTexts = { ...prevTexts };
				delete updatedTexts[removed.name];
				return updatedTexts;
			});
			return updated;
		});
	};

	const clearAllInput = () => {
		setManualText("");
		setFiles([]);
		setFileTexts({});
	};

	const textToFile = (text: string, filename: string): File => {
		const blob = new Blob([text], { type: "text/plain" });
		return new File([blob], filename, { type: "text/plain" });
	};

	const handleCheckPlagiarism = async () => {
		const combinedText = getCombinedText();

		if (!combinedText.trim()) {
			alert("Please input text or upload at least one file.");
			return;
		}

		const filename = files.length
			? `combined_${files.map((f) => f.name.split(".")[0]).join("_")}.txt`
			: `manual_input_${Date.now()}.txt`;

		const textFile = textToFile(combinedText, filename);

		try {
			await onCheck(textFile);
			clearAllInput(); // Clear only after successful check
			onShowResults?.();
		} catch (err: any) {
			alert("Error checking plagiarism: " + err.message);
		}
	};

	return (
		<FileUploadSection
			loading={loading}
			files={files}
			text={manualText}
			wordCount={countWords(getCombinedText())}
			handleFilesSelected={handleFilesSelected}
			handleTextChange={handleTextChange}
			handleCheckPlagiarism={handleCheckPlagiarism}
			clearText={clearAllInput}
			removeFile={removeFile}
			elapsedTime={elapsedTime}
		/>
	);
};

export default FileUploadHandle;
