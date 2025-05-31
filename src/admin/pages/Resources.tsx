import { useState } from "react";

interface Resource {
  id: number;
  title: string;
  description: string;
  source: string;
  fileName?: string;
  fileUrl?: string;
  uploadedAt: string;
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSource, setEditSource] = useState("");

  const ITEMS_PER_PAGE = 7;

  const isMeaningfulText = (text: string): boolean => {
    const words = text.trim().split(/\s+/);
    const validWords = words.filter((word) => /^[A-Za-z]{2,}$/.test(word));
    return validWords.length >= 2;
  };

  const isValidURL = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleUpload = () => {
    if (!title.trim() || !source.trim()) {
      alert("Title and Source are required.");
      return;
    }

    if (!isMeaningfulText(title)) {
      alert("Please enter a meaningful title (e.g., 'Research Dataset').");
      return;
    }

    if (!isMeaningfulText(source)) {
      alert("Please enter a valid source or author name (e.g., 'John Smith').");
      return;
    }

    if (!file && (!url || !isValidURL(url))) {
      alert("Please upload a file or provide a valid URL.");
      return;
    }

    const newResource: Resource = {
      id: resources.length + 1,
      title: title.trim(),
      description: description.trim(),
      source: source.trim(),
      fileName: file?.name,
      fileUrl: url || undefined,
      uploadedAt: new Date().toISOString().split("T")[0],
    };

    setResources([newResource, ...resources]);
    setTitle("");
    setDescription("");
    setSource("");
    setFile(null);
    setUrl("");
    setCurrentPage(1);
  };

  const filteredResources = resources.filter((r) =>
    [r.title, r.description, r.source, r.fileName, r.fileUrl]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const currentResources = filteredResources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startEdit = (resource: Resource) => {
    setEditId(resource.id);
    setEditTitle(resource.title);
    setEditDescription(resource.description);
    setEditSource(resource.source);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditDescription("");
    setEditSource("");
  };

  const saveEdit = () => {
    if (!editTitle.trim() || !editSource.trim()) {
      alert("Title and Source are required.");
      return;
    }
    if (!isMeaningfulText(editTitle)) {
      alert("Please enter a meaningful title.");
      return;
    }
    if (!isMeaningfulText(editSource)) {
      alert("Please enter a valid source.");
      return;
    }

    setResources((prev) =>
      prev.map((res) =>
        res.id === editId
          ? { ...res, title: editTitle.trim(), description: editDescription.trim(), source: editSource.trim() }
          : res
      )
    );
    cancelEdit();
  };

  return (
    <div className="mx-auto">
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
          />
          <input
            type="text"
            placeholder="Author *"
            className="p-2 border border-gray-300 rounded focus:outline-blue-500"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <textarea
            placeholder="Description"
            rows={2}
            className="p-2 border border-gray-300 rounded col-span-full focus:outline-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="file"
            className="p-2 border border-gray-300 rounded focus:outline-blue-500"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <input
            type="url"
            placeholder="Or provide file URL"
            className="p-2 border border-gray-300 rounded focus:outline-blue-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <button
          onClick={handleUpload}
          className="mt-8 bg-[#3C5773] text-white px-4 py-2 rounded hover:bg-[#1B5773] transition"
        >
          Upload Resource
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
      />

      {/* Table */}
      <div className="overflow-auto max-h-[500px] border border-gray-100 rounded shadow-sm">
        <table className="min-w-full divide-y divide-gray-300 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-left px-4 py-2">Author</th>
              <th className="text-left px-4 py-2">File/ Url</th>
              <th className="text-left px-4 py-2">Uploaded</th>
              <th className="text-left px-4 py-2">Update</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentResources.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {editId === res.id ? (
                    <input
                      type="text"
                      className="p-1 border border-gray-300 rounded w-full"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  ) : (
                    res.title
                  )}
                </td>
                <td className="px-4 py-2 text-gray-700 line-clamp-2 max-w-xs">
                  {editId === res.id ? (
                    <textarea
                      rows={2}
                      className="p-1 border border-gray-300 rounded w-full"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  ) : (
                    res.description
                  )}
                </td>
                <td className="px-4 py-2">
                  {editId === res.id ? (
                    <input
                      type="text"
                      className="p-1 border border-gray-300 rounded w-full"
                      value={editSource}
                      onChange={(e) => setEditSource(e.target.value)}
                    />
                  ) : (
                    res.source
                  )}
                </td>
                <td className="px-4 py-2 text-blue-600 max-w-xs truncate">
                  {res.fileName ? (
                    <span title={res.fileName}>{res.fileName}</span>
                  ) : res.fileUrl ? (
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      title={res.fileUrl}
                    >
                      {new URL(res.fileUrl).hostname +
                        "/" +
                        res.fileUrl.split("/").pop()}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2">{res.uploadedAt}</td>
                <td className="px-4 py-2">
                  {editId === res.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="mr-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(res)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredResources.length > ITEMS_PER_PAGE && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
