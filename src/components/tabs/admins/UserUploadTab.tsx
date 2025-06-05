import { useState } from "react";
import { useAuth } from "../../../utils/useAuth";
import { uploadResource } from "../../../api_helper/resources";

export default function UploadResourceForm() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authors, setAuthors] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [degree, setDegree] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [documentType, setDocumentType] = useState("Book");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const validatePublicationDate = (value: string) => {
    return /^(?:\d{4}|\d{4}-\d{2}-\d{2})$/.test(value) || value === "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setMessage("User not authenticated.");
    if (!file && !sourceUrl.trim()) return setMessage("Provide a file or source URL.");
    if (!validatePublicationDate(publicationDate)) {
      return setMessage("Invalid publication date format.");
    }

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("authors", authors);
    formData.append("affiliation", affiliation);
    formData.append("degree", degree);
    formData.append("publisher", publisher);
    formData.append("publication_date", publicationDate);
    formData.append("document_type", documentType);
    formData.append("source_url", sourceUrl);

    try {
      await uploadResource(formData, localStorage.getItem("access_token") || "");
      setMessage("Resource uploaded successfully!");
      setTitle("");
      setDescription("");
      setAuthors("");
      setAffiliation("");
      setDegree("");
      setPublisher("");
      setPublicationDate("");
      setDocumentType("Book");
      setSourceUrl("");
      setFile(null);
    } catch {
      setMessage("Failed to upload resource.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 ">
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Title</label>
        <input
          type="text"
          placeholder="Enter the resource title"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Description</label>
        <textarea
          placeholder="Write a brief description of the resource"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900 resize-y"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Authors (comma-separated)</label>
        <input
          type="text"
          placeholder="John Doe, Jane Smith"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Affiliation</label>
        <input
          type="text"
          placeholder="University or organization"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Degree</label>
        <input
          type="text"
          placeholder="e.g. PhD, MSc"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Publisher</label>
        <input
          type="text"
          placeholder="Publisher name"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Publication Date <span className="text-gray-500">(YYYY or YYYY-MM-DD)</span>
        </label>
        <input
          type="text"
          placeholder="2023 or 2023-05-10"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={publicationDate}
          onChange={(e) => setPublicationDate(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Document Type</label>
        <select
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option>Book</option>
          <option>Article</option>
          <option>Thesis</option>
          <option>Report</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Source URL</label>
        <input
          type="url"
          placeholder="https://example.com"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Upload File</label>
        <input
          type="file"
          className="w-full text-gray-700"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Upload
      </button>

      {message && (
        <p
          className={`mt-2 text-sm ${
            message.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
