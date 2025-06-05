import  { useState } from "react";
import UploadedResourcesTable from "../../components/tabs/admins/UploadedResourcesTab";
import UploadResourceForm from "../../components/tabs/admins/UserUploadTab";

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "view">("upload");

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resource Management</h1>

      {/* Tabs buttons */}
      <div className="flex border-b border-gray-300 mb-4">
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2 -mb-px border-b-2 font-medium ${
            activeTab === "upload"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
          aria-selected={activeTab === "upload"}
          role="tab"
          type="button"
        >
          Upload Resource
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`ml-4 px-4 py-2 -mb-px border-b-2 font-medium ${
            activeTab === "view"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
          aria-selected={activeTab === "view"}
          role="tab"
          type="button"
        >
          Uploaded Resources
        </button>
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === "upload" && <UploadResourceForm />}
        {activeTab === "view" && <UploadedResourcesTable />}
      </div>
    </div>
  );
}
