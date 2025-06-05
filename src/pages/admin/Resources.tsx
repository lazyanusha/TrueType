import { useEffect, useState } from "react";
import {
  deleteResource,
  fetchResources,
  updateResource,
  uploadResource,
} from "../../api_helper/resources";

interface Resource {
  id: number;
  title: string;
  description: string;
  authors: string[];
  file_name?: string;
  file_url?: string;
  created_at: string;
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState(""); // comma-separated authors string
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSource, setEditSource] = useState("");
  const [loading, setLoading] = useState(false);

  const ITEMS_PER_PAGE = 7;
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchResources(token)
      .then((data) => {
        const formatted = data.map((res: any) => ({
          ...res,
          authors: Array.isArray(res.authors) ? res.authors : [],
        }));
        setResources(formatted);
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const isMeaningfulText = (text: string) =>
    text
      .trim()
      .split(/\s+/)
      .filter((w) => /^[A-Za-z]{2,}$/.test(w)).length >= 2;

  const isValidURL = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !source.trim()) {
      alert("Title and Author(s) are required.");
      return;
    }
    if (!isMeaningfulText(title) || !isMeaningfulText(source)) {
      alert("Enter meaningful title and author(s).");
      return;
    }
    if (!file && (!url || !isValidURL(url))) {
      alert("Upload a file or provide a valid URL.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", description);

    // convert authors to array from comma-separated string
    const authorsArray = source
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    // Send authors as JSON string (backend expects JSON string)
    formData.append("authors", JSON.stringify(authorsArray));

    if (file) {
      formData.append("file", file);
    } else if (url) {
      formData.append("file_url", url);
    }

    try {
      setLoading(true);
      const newRes = await uploadResource(formData, token);
      newRes.authors = Array.isArray(newRes.authors) ? newRes.authors : [];
      setResources((prev) => [newRes, ...prev]);
      setTitle("");
      setDescription("");
      setSource("");
      setFile(null);
      setUrl("");
      setCurrentPage(1);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (res: Resource) => {
    setEditId(res.id);
    setEditTitle(res.title);
    setEditDescription(res.description);
    setEditSource(res.authors.join(", "));
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditDescription("");
    setEditSource("");
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editSource.trim()) {
      alert("Title and Author(s) are required.");
      return;
    }
    const authorsArray = editSource
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      const updated = await updateResource(
        editId!,
        {
          title: editTitle,
          description: editDescription,
          authors: authorsArray,
        },
        token
      );

      updated.authors = Array.isArray(updated.authors) ? updated.authors : [];
      setResources((prev) =>
        prev.map((res) => (res.id === editId ? updated : res))
      );
      cancelEdit();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;

    try {
      setLoading(true);
      await deleteResource(id, token);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((r) =>
    [
      r.title,
      r.description,
      r.authors.join(", "),
      r.file_name ?? "",
      r.file_url ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const currentResources = filteredResources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dataset Resources</h1>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Upload Resource</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title *"
            className="p-2 border border-gray-300 rounded focus:outline-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Author(s) * (comma separated)"
            className="p-2 border border-gray-300 rounded focus:outline-blue-500"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={loading}
          />
          <textarea
            placeholder="Description"
            rows={2}
            className="p-2 border border-gray-300 rounded col-span-full focus:outline-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <input
            type="file"
            className="p-2 border border-gray-300 rounded focus:outline-blue-500"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
          />
          <input
            type="url"
            placeholder="Or provide file URL"
            className="p-2 border border-gray-300 rounded focus:outline-blue-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          onClick={handleUpload}
          className={`mt-8 bg-[#3C5773] text-white px-4 py-2 rounded hover:bg-[#1B5773] transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload Resource"}
        </button>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search uploaded resources..."
        className="w-full mb-6 mt-4 p-3 border border-gray-400 rounded focus:outline-blue-500"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        disabled={loading}
      />

      {/* Table UI */}
      <div className="overflow-auto max-h-[500px] border border-gray-100 rounded shadow-sm">
        <table className="min-w-full divide-y divide-gray-300 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-left px-4 py-2">Author(s)</th>
              <th className="text-left px-4 py-2">File/URL</th>
              <th className="text-left px-4 py-2">Uploaded</th>
              <th className="text-center px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentResources.map((res) => (
              <tr
                key={res.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                {editId === res.id ? (
                  <>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        rows={1}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editSource}
                        onChange={(e) => setEditSource(e.target.value)}
                        placeholder="Author(s) comma separated"
                        className="w-full border border-gray-300 rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-2 text-sm text-blue-700">
                      {res.file_name || res.file_url ? (
                        res.file_url ? (
                          <a
                            href={res.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            File URL
                          </a>
                        ) : (
                          res.file_name
                        )
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2">
                      {new Date(res.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-center space-x-1">
                      <button
                        onClick={saveEdit}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{res.title}</td>
                    <td className="p-2">{res.description || "-"}</td>
                    <td className="p-2">{res.authors.join(", ") || "-"}</td>
                    <td className="p-2 text-sm text-blue-700">
                      {res.file_name || res.file_url ? (
                        res.file_url ? (
                          <a
                            href={res.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            File URL
                          </a>
                        ) : (
                          res.file_name
                        )
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2">
                      {new Date(res.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-center space-x-1">
                      <button
                        onClick={() => startEdit(res)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>{" "}
                  </>
                )}{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          disabled={currentPage === 1 || loading}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Prev
        </button>
        <span className="px-4">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((page) => Math.min(page + 1, totalPages))
          }
          disabled={currentPage === totalPages || loading}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
