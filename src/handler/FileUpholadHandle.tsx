import { useState, useEffect, type ChangeEvent } from "react";
import { extractTextFromFile } from "../utils/FileUtils";
import FileUploadSection from "../components/FileUploadSection";

interface Props {
  onCheck: (file: File) => Promise<void>;
  onShowResults?: () => void;
  loading?: boolean;
}

const FileUploadHandle = ({ onCheck, onShowResults }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileTexts, setFileTexts] = useState<Record<string, string>>({});
  const [manualText, setManualText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper: Count words
  const countWords = (text: string) =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  // Combine file + manual texts
  const getCombinedText = () =>
    [...Object.values(fileTexts), manualText].filter(Boolean).join("\n\n");

  // Update word count
  useEffect(() => {
    setWordCount(countWords(getCombinedText()));
  }, [fileTexts, manualText]);

  // Handle file selection
  const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLoading(true);

    const newFiles = Array.from(e.target.files);
    const successfulFiles: File[] = [];
    const newFileTexts: Record<string, string> = {};

    for (const file of newFiles) {
      try {
        const text = await extractTextFromFile(file);
        newFileTexts[file.name] = text;
        successfulFiles.push(file); // Only add file if text extraction succeeds
      } catch (err) {
        console.error("Failed to extract text:", err);
        alert(`${file.name} was skipped due to format or readability issues.`);
      }
    }

    setFiles((prev) => [...prev, ...successfulFiles]); // Only add successful files
    setFileTexts((prev) => ({ ...prev, ...newFileTexts }));
    setLoading(false);
  };

  // Manual text input
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setManualText(e.target.value);
  };

  // Remove a file
  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      const removedFile = updated.splice(index, 1)[0];
      setFileTexts((prevTexts) => {
        const updatedTexts = { ...prevTexts };
        delete updatedTexts[removedFile.name];
        return updatedTexts;
      });
      return updated;
    });
  };

  // Clear all content
  const clearText = () => {
    setManualText("");
    setWordCount(0);
    setFiles([]);
    setFileTexts({});
  };

  // Convert combined text to .txt file
  const textToFile = (text: string): File => {
    const blob = new Blob([text], { type: "text/plain" });
    return new File([blob], "combined_input.txt", { type: "text/plain" });
  };

  // Trigger plagiarism check
  const handleCheckPlagiarism = async () => {
    const combinedText = getCombinedText();
    if (!combinedText.trim()) {
      alert("Please input text or upload at least one file.");
      return;
    }

    setLoading(true);
    try {
      const textFile = textToFile(combinedText);
      await onCheck(textFile);
      clearText();
      onShowResults?.();
    } catch (err: any) {
      alert("Error checking plagiarism: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FileUploadSection
      loading={loading}
      files={files}
      text={manualText}
      wordCount={wordCount}
      handleFilesSelected={handleFilesSelected}
      handleTextChange={handleTextChange}
      handleCheckPlagiarism={handleCheckPlagiarism}
      clearText={clearText}
      removeFile={removeFile}
      extractedTexts={fileTexts}
    />
  );
};

export default FileUploadHandle;
