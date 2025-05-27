import { useState } from "react";
import { checkPlagiarism } from "../handler/PlagiarismService";
import FileUploadHandle from "./FileUpholadHandle";

const PlagiarismChecker = ({ onResult, onShowResults }: { onResult?: (data: any) => void; onShowResults?: () => void }) => {
  const [loading, setLoading] = useState(false);

  // Backend call handler
  const handleCheck = async (file: File) => {
    setLoading(true);
    try {
      const resultData = await checkPlagiarism(file);
      if (onResult) onResult(resultData);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      throw error; 
    } finally {
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
