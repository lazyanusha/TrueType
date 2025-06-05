import { FileTextIcon } from "lucide-react";

type Report = {
  id: number;
  title: string;
  date: string;
};

type Props = {
  reports: Report[];
};

const ReportsTab = ({ reports }: Props) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <FileTextIcon className="w-5 h-5" /> Plagiarism Reports
      </h2>
      {reports.length === 0 ? (
        <p className="text-gray-500">No reports found.</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="border border-gray-300 rounded px-4 py-3 hover:shadow-md cursor-pointer"
              onClick={() => alert(`Open report ID: ${r.id}`)}
            >
              <p className="font-medium">{r.title}</p>
              <span className="text-sm text-gray-500">{r.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportsTab;
