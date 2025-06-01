import React, { useRef, useState, type ChangeEvent } from "react";
import ConfettiEffect from "./ConfettieEffect";
import { useAuth } from "../utils/useAuth";

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
const MAX_WORDS = 1000;

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
  const { user } = useAuth(); // <-- get user info internally

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Counts for non-logged in user usage limits
  const [textSubmissionsCount, setTextSubmissionsCount] = useState(0);
  const [fileUploadsCount, setFileUploadsCount] = useState(0);

  // Non-logged-in user usage limits
  const nonUserExceededLimit =
    !user &&
    (textSubmissionsCount >= MAX_TEXT_SUBMISSIONS ||
      fileUploadsCount >= MAX_FILE_UPLOADS);

  const supportedFiles = files.filter((file) => isSupportedFile(file.name));
  const showInputSections = !nonUserExceededLimit;
  const hasEnoughSentences = countSentences(text) >= 10;

  // Handle file upload click
  const handleFileUpload = () => {
    if (loading || nonUserExceededLimit) {
      if (nonUserExceededLimit) {
        alert(
          "You've reached the maximum file upload limit. Please log in to get unlimited access."
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

  // When files change

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    // Check unsupported files
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

    if (!user) {
      if (fileUploadsCount + selectedFiles.length > MAX_FILE_UPLOADS) {
        alert(
          "You've reached the maximum file upload limit. Please log in to get unlimited access."
        );
        e.target.value = "";
        return;
      }
      if (text.trim()) {
        alert("You can only use either text input or file upload at a time.");
        e.target.value = "";
        return;
      }

      // Only count words for .txt files, skip others or alert user
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
            setFileUploadsCount((prev) => prev + selectedFiles.length);
            handleFilesSelected(e);
          })
          .catch(() => {
            alert("Error reading files. Please try again.");
            e.target.value = "";
          });
      } else {
        // No .txt files, but user uploaded .pdf/.docx - require login
        alert("Please log in to upload PDF or DOCX files.");
        e.target.value = "";
      }
    } else {
      // logged in user, proceed normally
      handleFilesSelected(e);
    }
  };

  // When text changes
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

  // When Check button clicked
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
          "You've reached the maximum number of text submissions. Please log in to continue."
        );
        return;
      }
      if (fileUploadsCount >= MAX_FILE_UPLOADS) {
        alert(
          "You've reached the maximum file upload limit. Please log in to get unlimited access."
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
      setTextSubmissionsCount((prev) => prev + 1); // increment on submission
    }

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
        <p className="text-lg font-semibold">
          Drag and drop your files here or click to upload
        </p>
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

      {/* Only show textarea and files if not over limit or logged in */}
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
              ? "You have reached your usage limit. Please log in for more."
              : "Check for plagiarism"
          }
        >
          {loading ? "Checking..." : "Check Plagiarism"}
        </button>
      </div>

      {!user && (
        <p className="mt-3 text-xs text-red-700">
          Note: Guests can only check up to 1000 words and limited number of
          submissions. Please log in for unlimited access.
        </p>
      )}

      <ConfettiEffect active={loading} />
    </section>
  );
};

export default FileUploadSection;
