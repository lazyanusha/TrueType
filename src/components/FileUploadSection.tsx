import React, { type ChangeEvent, useRef } from "react";
import { motion } from "framer-motion";

interface FileUploadSectionProps {
  loading: boolean;
  files: File[];
  text: string;
  wordCount: number;
  handleFilesSelected: (e: ChangeEvent<HTMLInputElement>) => void;
  handleTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleCheckPlagiarism: () => void;
  clearText: () => void;
  removeFile: (index: number) => void;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <section className="bg-white rounded-xl p-8 shadow-xl mb-12 text-gray-900 relative">
      {/* File Upload Box */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-blue-500 ${
          loading ? "opacity-50 cursor-not-allowed" : "border-gray-300"
        }`}
        onClick={handleFileUpload}
      >
        <p className="text-lg font-semibold">
          Drag and drop your files here or click to upload
        </p>
        <p className="text-sm text-gray-600 mt-1">Supports multiple files</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFilesSelected}
          disabled={loading}
        />
      </div>

      {/* Textarea */}
      <div className="relative mt-6">
        <textarea
          className="w-full h-48 border border-gray-300 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste your text here to check for plagiarism..."
          value={text}
          onChange={handleTextChange}
          disabled={loading}
        />

        {/* Clear Button for Text */}
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
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span
          className={`text-sm ${
            wordCount > 1000 ? "text-red-600 font-bold" : "text-gray-700"
          }`}
        >
          Words: {wordCount} / 1000
        </span>

        <button
          onClick={handleCheckPlagiarism}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear",
              }}
              className="w-5 h-5 border-4 border-white border-t-transparent rounded-full mr-3"
            />
          )}
          Check for Plagiarism
        </button>
      </div>

      {/* File List with per-file clear buttons */}
      {files.length > 0 && (
        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <p>Uploaded files:</p>
          <ul>
            {files.map((file, i) => (
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
    </section>
  );
};

export default FileUploadSection;
