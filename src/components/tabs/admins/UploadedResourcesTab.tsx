import { useEffect, useState } from "react";
import {
  deleteResource,
  fetchResources,
  updateResource,
} from "../../../api_helper/resources";
import { useAuth } from "../../../utils/useAuth";
import React from "react";

type Resource = {
  id: number;
  resource_title: string;
  authors: string[];
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
  const [editForm, setEditForm] = useState({
    resource_title: "",
    authors: "",
    file_url: "",
    publisher: "",
    publication_date: "",
    content: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token") || "";
        const data = await fetchResources(token);
        setResources(data);
      } catch {
        console.error("Failed to fetch resources");
      }
    };
    fetchData();
  }, []);

  const startEdit = (
    res: Resource & { file_url?: string; content?: string }
  ) => {
    setEditingId(res.id);
    setEditForm({
      resource_title: res.resource_title || "",
      authors: res.authors?.join(", ") || "",
      file_url: (res as any).file_url || "",
      publisher: res.publisher || "",
      publication_date: res.publication_date
        ? res.publication_date.split("T")[0]
        : "",
      content: (res as any).content || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      resource_title: "",
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
      const token = localStorage.getItem("access_token") || "";
      const updateData = {
        resource_title: editForm.resource_title,
        authors: editForm.authors.split(",").map((a) => a.trim()),
        file_url: editForm.file_url,
        publisher: editForm.publisher,
        publication_date: editForm.publication_date,
        content: editForm.content,
      };

      await updateResource(id, updateData, token);

      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updateData } : r))
      );

      setEditingId(null);
    } catch {
      alert("Failed to update resource");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("access_token") || "";
      await deleteResource(id, token);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Failed to delete resource.");
    }
  };

  if (!user)
    return (
      <p className="text-center text-gray-600">
        Please login to view resources.
      </p>
    );

  return (
    <div>
      {resources.length === 0 ? (
        <p className="text-center text-gray-500 italic">
          No resources uploaded yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Authors</th>
                <th className="px-4 py-2">Content</th>
                <th className="px-4 py-2">Source URL</th>
                <th className="px-4 py-2">File Name</th>
                <th className="px-4 py-2">Publisher</th>
                <th className="px-4 py-2">Publication Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {resources.map((res) => (
                <tr key={res.id}>
                  <td className="px-4 py-2">{res.resource_title}</td>
                  <td className="px-4 py-2">{res.authors?.join(", ")}</td>
                  <td className="px-4 py-2">{res.content}</td>
                  <td className="px-4 py-2">
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {res.file_url}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    {res.file_path?.split("/").pop()}
                  </td>
                  <td className="px-4 py-2">{res.publisher || "—"}</td>
                  <td className="px-4 py-2">
                    {res.publication_date
                      ? new Date(res.publication_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => startEdit(res)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingId !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
          onClick={cancelEdit}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Edit Resource
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit(editingId);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.resource_title}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Authors (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="authors"
                    value={editForm.authors}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source URL
                  </label>
                  <input
                    type="url"
                    name="file_url"
                    value={editForm.file_url}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publisher
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={editForm.publisher}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    name="publication_date"
                    value={editForm.publication_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    content
                  </label>
                  <textarea
                    name="content"
                    value={editForm.content}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
