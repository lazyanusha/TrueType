import { useState } from "react";
import { checkPlagiarism } from "../utils/PlagiarismService";
import FileUploadHandle from "../handler/FileUpholadHandle";
import type { ResultData } from "../types/resultTypes"; // Changed from ExtendedResultData to ResultData

const PlagiarismChecker = ({
  onResult,
  onShowResults,
}: {
  onResult?: (data: ResultData) => void; // Updated type
  onShowResults?: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheck = async (file: File) => {
    setLoading(true);
    try {
      const resultData: ResultData = await checkPlagiarism(file); // Updated type
      console.log("Starting plagiarism check...");
      console.log("Backend response:", resultData);
      
      if (onResult) onResult(resultData);
      if (onShowResults) onShowResults();
    } catch (error: any) {
      console.error("Error during plagiarism check:", error);
      alert(`Error: ${error.message}`);
    } finally {
      console.log("Loading finished");
      setLoading(false);
    }
  };

  return (
    <FileUploadHandle
      onCheck={handleCheck}
      onShowResults={onShowResults}
      loading={loading}
    />
  );
};

export default PlagiarismChecker;