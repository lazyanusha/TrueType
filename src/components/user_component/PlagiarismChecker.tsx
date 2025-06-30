import type { resultTypes } from "../public/types/resultTypes";
import FileUploadHandle from "../public/handler/FileUpholadHandle";

const PlagiarismChecker = ({
	onCheck,
	onShowResults,
	loading,
	elapsedTime,
}: {
	onResult?: (data: resultTypes) => void;
	onCheck: (file: File) => void;
	onShowResults?: () => void;
	loading: boolean;
	elapsedTime: number;
}) => {
	return (
		<>
			<FileUploadHandle
				onCheck={onCheck}
				onShowResults={onShowResults}
				loading={loading}
				elapsedTime={elapsedTime}
			/>
		</>
	);
};

export default PlagiarismChecker;
