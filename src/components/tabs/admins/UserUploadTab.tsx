import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/useAuth";
import { useResourceApi } from "../../../api_helper/resources";

type Author = {
  name: string;
  degree: string;
  affiliation: string;
  title: string;
};

export default function UploadResourceForm() {
  const { user } = useAuth();
  const { uploadResource } = useResourceApi();

  // Resource fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [Doc_Type, setDoc_type] = useState("Book");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Authors - start with one empty author
  const [authors, setAuthors] = useState<Author[]>([
    { name: "", degree: "", affiliation: "", title: "" },
  ]);

  const [message, setMessage] = useState("");

  const validatePublicationDate = (value: string) => {
    return /^(?:\d{4}|\d{4}-\d{2}-\d{2})$/.test(value) || value === "";
  };

  const handleAuthorChange = (
    index: number,
    field: keyof Author,
    value: string
  ) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([
      ...authors,
      { name: "", degree: "", affiliation: "", title: "" },
    ]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length === 1) return; // At least one author required
    const newAuthors = authors.filter((_, i) => i !== index);
    setAuthors(newAuthors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setMessage("User not authenticated.");
    if (!file && !fileUrl.trim())
      return setMessage("Provide a file or source URL.");
    if (!validatePublicationDate(publicationDate)) {
      return setMessage("Invalid publication date format.");
    }

    // Validate authors (all must have names)
    for (const author of authors) {
      if (!author.name.trim()) {
        return setMessage("Each author must have a name.");
      }
    }

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("publisher", publisher);
    formData.append("publication_date", publicationDate);
    formData.append("Doc_Type", Doc_Type);
    formData.append("file_url", fileUrl);

    // Append authors as JSON string
    formData.append("authors", JSON.stringify(authors));

    try {
      await uploadResource(formData);
      setMessage("Resource uploaded successfully!");
      setTitle("");
      setContent("");
      setPublisher("");
      setPublicationDate("");
      setDoc_type("Book");
      setFileUrl("");
      setFile(null);
      setAuthors([{ name: "", degree: "", affiliation: "", title: "" }]);
    } catch {
      setMessage("Failed to upload resource.");
    }
  };

  useEffect(() => {
    if (message && message.toLowerCase().includes("success")) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        {/* Toast Message */}
        <div className="fixed top-0 inset-x-0 flex justify-center z-50 mt-4 pointer-events-none">
          <div
            className={`bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all transform duration-500 ease-out ${
              showToast
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
          >
            {message}
          </div>
        </div>
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
        <label className="block text-gray-700 font-semibold mb-1">
          Description
        </label>
        <textarea
          placeholder="Write a brief description of the resource"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900 resize-y"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Publisher
        </label>
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
          Publication Date{" "}
          <span className="text-gray-500">(YYYY-MM-DD)</span>
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
        <label className="block text-gray-700 font-semibold mb-1">
          Document Type
        </label>
        <select
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={Doc_Type}
          onChange={(e) => setDoc_type(e.target.value)}
        >
          <option>Book</option>
          <option>Article</option>
          <option>Thesis</option>
          <option>Report</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Authors
        </label>
        {authors.map((author, i) => (
          <div key={i} className="mb-4 border border-gray-200 py-3 px-4 rounded bg-gray-50 relative">
            <div className="mb-2">
              <label className="block text-gray-600 mb-1">Name *</label>
              <input
                type="text"
                value={author.name}
                onChange={(e) => handleAuthorChange(i, "name", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1"
                required
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-600 mb-1">Degree</label>
              <input
                type="text"
                value={author.degree}
                onChange={(e) =>
                  handleAuthorChange(i, "degree", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-600 mb-1">Affiliation</label>
              <input
                type="text"
                value={author.affiliation}
                onChange={(e) =>
                  handleAuthorChange(i, "affiliation", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={author.title}
                onChange={(e) => handleAuthorChange(i, "title", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>

            {authors.length > 1 && (
              <button
                type="button"
                onClick={() => removeAuthor(i)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                aria-label="Remove author"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addAuthor}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
        >
          + Add Author
        </button>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Source URL
        </label>
        <input
          type="url"
          placeholder="https://example.com"
          className="w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 text-gray-900"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Upload File
        </label>
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
    </form>
  );
}
