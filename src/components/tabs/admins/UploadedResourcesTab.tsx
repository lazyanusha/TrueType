import { useEffect, useState } from "react";
import { useResourceApi } from "../../../api_helper/resources";
import { useAuth } from "../../../utils/useAuth";
import React from "react";
import { Pencil, Trash2 } from "lucide-react";

type Resource = {
  id: number;
  title: string;
  authors: Author[];
  file_path: string;
  file_url: string;
  publisher: string;
  publication_date: string;
  doc_type: string;
  created_at: string;
  updated_at: string;
  content: string;
};

export default function UploadedResourcesTable() {
  const { user } = useAuth();
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { fetchResources, updateResource, deleteResource } = useResourceApi();
  const [editForm, setEditForm] = useState({
    title: "",
    authors: "",
    file_url: "",
    publisher: "",
    publication_date: "",
    content: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [authorPopup, setAuthorPopup] = useState<Author[] | null>(null);
  const [contentPopup, setContentPopup] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchResources();
        setResources(data);
      } catch {
        console.error("Failed to fetch resources");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (message && /success/i.test(message)) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const startEdit = (res: Resource) => {
    setEditingId(res.id);
    setEditForm({
      title: res.title || "",
      authors: res.authors?.map((a) => a.name).join(", ") || "",
      file_url: res.file_url || "",
      publisher: res.publisher || "",
      publication_date: res.publication_date?.split("T")[0] || "",
      content: res.content || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      title: "",
      authors: "",
      file_url: "",
      publisher: "",
      publication_date: "",
      content: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id: number) => {
    try {
      const updateData = {
        title: editForm.title,
        authors: editForm.authors.split(",").map((a) => ({ name: a.trim() })),
        file_url: editForm.file_url,
        publisher: editForm.publisher,
        publication_date: editForm.publication_date,
        content: editForm.content,
      };

      await updateResource(id, {
        title: updateData.title,
        authors: updateData.authors,
        file_url: updateData.file_url,
        content: updateData.content,
      });

      // ✅ Update the resource in local state
      setResources((prevResources) =>
        prevResources.map((res) =>
          res.id === id
            ? {
                ...res,
                title: updateData.title,
                authors: updateData.authors,
                file_url: updateData.file_url,
                content: updateData.content,
                updated_at: new Date().toISOString(),
              }
            : res
        )
      );

      setEditingId(null);
      setMessage("Resource updated successfully.");
    } catch {
      setMessage("Failed to update resource.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) return;

    try {
      await deleteResource(id);
      const updated = await fetchResources(); // Re-fetch from server
      setResources(updated);
      setMessage("Resource deleted successfully.");
    } catch {
      setMessage("Failed to delete resource.");
    }
  };

  const paginatedResources = resources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!user) {
    return (
      <p className="text-center text-gray-600">
        Please login to view resources.
      </p>
    );
  }

  return (
    <div className="max-w-full">
      {resources.length === 0 ? (
        <p className="text-center text-gray-500 italic">
          No resources uploaded yet.
        </p>
      ) : (
        <div className="rounded-md shadow-sm">
          {/* Toast Message */}
          <div
            className={`px-6 py-3 rounded-lg shadow-lg transition-all transform duration-500 ease-out ${
              showToast
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            } ${
              /success/i.test(message)
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {message}
          </div>

          <table className="min-w-full border-collapse table-auto text-left text-sm font-sans">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="px-4 py-2 w-10">#</th>
                <th className="px-4 py-2 min-w-[100px]">Title</th>
                <th className="px-4 py-2 min-w-[130px]">Authors</th>
                <th className="px-4 py-2 min-w-[200px]">Content</th>
                <th className="px-4 py-2 min-w-[140px]">Source URL</th>
                <th className="px-4 py-2 min-w-[120px]">File Name</th>
                <th className="px-4 py-2 min-w-[150px]">Publisher</th>
                <th className="px-4 py-2 w-[120px]">Publication Date</th>
                <th className="px-4 py-2 w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResources.map((res, i) => (
                <tr
                  key={res.id}
                  className="even:bg-white odd:bg-gray-50 hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-2 font-medium text-gray-700">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>
                  <td
                    className="px-4 py-4 font-semibold text-gray-800 truncate max-w-[180px]"
                    title={res.title}
                  >
                    {res.title}
                  </td>
                  <td className="px-4 py-2 ">
                    <button
                      onClick={() => setAuthorPopup(res.authors)}
                      className=""
                      title="View full author details"
                    >
                      {res.authors?.map((a) => a.name).join(", ")}
                    </button>
                  </td>
                  <td className="px-4 py-2 max-w-[200px]">
                    <button
                      onClick={() => setContentPopup(res.content)}
                      className="text-gray-700 hover:text-gray-900 focus:outline-none whitespace-pre-wrap overflow-hidden block text-ellipsis max-h-[3.6em] leading-[1.2em]"
                      title="Click to view full content"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                        cursor: "pointer",
                      }}
                    >
                      {res.content.length > 150
                        ? res.content.slice(0, 150) + "..."
                        : res.content}
                    </button>
                  </td>
                  <td className="px-4 py-2 max-w-[140px] break-words">
                    {res.file_url ? (
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                        title={res.file_url}
                      >
                        {res.file_url.length > 30
                          ? res.file_url.slice(0, 30) + "..."
                          : res.file_url}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td
                    className="px-4 py-2 max-w-[120px] truncate"
                    title={res.file_path?.split("/").pop() || "—"}
                  >
                    {res.file_path?.split("/").pop() || "—"}
                  </td>
                  <td
                    className="px-4 py-2 truncate max-w-[110px]"
                    title={res.publisher || "—"}
                  >
                    {res.publisher || "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-600 min-w-[150px]">
                    {res.publication_date
                      ? new Date(res.publication_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 flex flex-row space-x-6">
                    <button
                      onClick={() => startEdit(res)}
                      title="Edit Resource"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(res.id)}
                      title="Delete Resource"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-5 flex justify-center space-x-2 select-none">
            {Array.from({
              length: Math.ceil(resources.length / itemsPerPage),
            }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === idx + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
                }`}
                aria-current={currentPage === idx + 1 ? "page" : undefined}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit form modal */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <h3 className="text-lg font-semibold mb-4">Edit Resource</h3>

            <label className="block mb-2 font-medium text-gray-700">
              Title
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-2 font-medium text-gray-700">
              Authors (comma separated)
              <input
                type="text"
                name="authors"
                value={editForm.authors}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-2 font-medium text-gray-700">
              Source URL
              <input
                type="text"
                name="file_url"
                value={editForm.file_url}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-2 font-medium text-gray-700">
              Publisher
              <input
                type="text"
                name="publisher"
                value={editForm.publisher}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-2 font-medium text-gray-700">
              Publication Date
              <input
                type="date"
                name="publication_date"
                value={editForm.publication_date}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-4 font-medium text-gray-700">
              Content
              <textarea
                name="content"
                value={editForm.content}
                onChange={handleChange}
                rows={5}
                className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </label>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => saveEdit(editingId)}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author popup */}
      {authorPopup && (
        <div
          onClick={() => setAuthorPopup(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-md shadow-lg max-w-md w-full p-6 space-y-3 max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-2">Authors Details</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {authorPopup.map((author, idx) => (
                <li key={idx} className="break-words">
                  <span className="font-semibold">{author.name}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setAuthorPopup(null)}
              className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Content popup */}
      {contentPopup && (
        <div
          onClick={() => setContentPopup(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-md shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 whitespace-pre-wrap text-gray-800"
          >
            <h3 className="text-lg font-semibold mb-4">Full Content</h3>
            <div>{contentPopup}</div>
            <button
              onClick={() => setContentPopup(null)}
              className="mt-6 px-5 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
