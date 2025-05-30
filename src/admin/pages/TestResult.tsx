import  { useState, useMemo } from "react";

const initialTestRecords = [
  {
    id: "TST-001",
    name: "Plagiarism Detection Test",
    dateTime: "2025-05-25 10:00",
    testedBy: "John Doe",
    type: "Functional",
    status: "Passed",
  },
  {
    id: "TST-002",
    name: "Subscription Flow Test",
    dateTime: "2025-05-26 14:30",
    testedBy: "Jane Smith",
    type: "Integration",
    status: "Failed",
  },
  // Add more sample records here
];

export default function TestRecords() {
  const [records] = useState(initialTestRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");

  // Filter and search logic
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.testedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "All" || record.status === filterStatus;
      const matchesType = filterType === "All" || record.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [records, searchTerm, filterStatus, filterType]);

  // Export CSV helper
  const exportCSV = () => {
    const headers = ["Test ID", "Test Name", "Date & Time", "Tested By", "Test Type", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredRecords.map((r) =>
        [r.id, r.name, r.dateTime, r.testedBy, r.type, r.status].map((v) => `"${v}"`).join(",")
      ),
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "test-records.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (record: { id: any; name: any; dateTime?: string; testedBy?: string; type?: string; status?: string; }) => {
    alert(`Viewing details for Test ID: ${record.id}\nName: ${record.name}`);
    // You can replace with modal or page navigation
  };

  return (
    <div className=" mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Test Records</h1>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <input
          type="text"
          placeholder="Search by Test ID, Name or Tester"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All Statuses</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All Types</option>
          <option value="Functional">Functional</option>
          <option value="Integration">Integration</option>
          <option value="Performance">Performance</option>
          <option value="Security">Security</option>
        </select>

        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Export CSV
        </button>

        <button
          onClick={() => alert("Navigate to Add New Test form")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add New Test
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-300 rounded">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-gray-400 border-b">Test ID</th>
              <th className="py-2 px-4 border-gray-400 border-b">Test Name</th>
              <th className="py-2 px-4 border-gray-400 border-b">Date & Time</th>
              <th className="py-2 px-4 border-gray-400 border-b">Tested By</th>
              <th className="py-2 px-4 border-gray-400 border-b">Test Type</th>
              <th className="py-2 px-4 border-gray-400 border-b">Status</th>
              <th className="py-2 px-4 border-gray-400 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No test records found.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{record.id}</td>
                  <td className="py-2 px-4 border-b">{record.name}</td>
                  <td className="py-2 px-4 border-b">{record.dateTime}</td>
                  <td className="py-2 px-4 border-b">{record.testedBy}</td>
                  <td className="py-2 px-4 border-b">{record.type}</td>
                  <td
                    className={`py-2 px-4 border-b font-semibold ${
                      record.status === "Passed" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {record.status}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
