import { useState, useEffect } from "react";
import { useResourceApi } from "../../api_helper/resources";
import { useAuth } from "../../utils/useAuth";

type Author = {
  name: string;
  degree: string;
  affiliation: string;
  title: string;
};

type Props = {
  resourceId: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditResourceModal({ resourceId, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const { getResourceById, updateResource } = useResourceApi();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function fetchResource() {
      setLoading(true);
      try {
        const data = await getResourceById(resourceId);
        setTitle(data.title || "");
        setContent(data.content || "");
        setPublisher(data.publisher || "");
        setPublicationDate(data.publication_date || "");
        setFileUrl(data.file_url || "");

        // Properly parse and fallback
        if (Array.isArray(data.authors)) {
          setAuthors(data.authors.map((a: any) => ({
            name: a.name || "",
            degree: a.degree || "",
            affiliation: a.affiliation || "",
            title: a.title || "",
          })));
        } else {
          setAuthors([{ name: "", degree: "", affiliation: "", title: "" }]);
        }
      } catch (error) {
        setMessage("Failed to load resource data.");
      } finally {
        setLoading(false);
      }
    }

    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: "", degree: "", affiliation: "", title: "" }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length === 1) return;
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setMessage("User not authenticated.");

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("publisher", publisher);
    formData.append("publication_date", publicationDate);
    formData.append("file_url", fileUrl);
    formData.append("authors", JSON.stringify(authors));

    try {
      await updateResource(resourceId, formData);
      setMessage("Resource updated successfully!");
      setShowToast(true);
      onSuccess();
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 2000);
    } catch {
      setMessage("Failed to update resource.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl text-center">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0  bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg relative max-h-screen overflow-y-auto">
        <button className="absolute top-2 right-2 text-gray-600" onClick={onClose}>
          &times;
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {showToast && (
            <div className="bg-green-500 text-white px-4 py-2 rounded text-center">
              {message}
            </div>
          )}
          {!showToast && message && (
            <div className="bg-red-500 text-white px-4 py-2 rounded text-center">
              {message}
            </div>
          )}

          <h2 className="text-xl font-bold mb-4">Edit Resource</h2>

          <input
            type="text"
            placeholder="Title"
            className="w-full border-b border-gray-300 outline-none py-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="w-full border-b border-gray-300 outline-none py-1"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <input
            type="text"
            placeholder="Publisher"
            className="w-full border-b border-gray-300 outline-none py-1"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
          />

          <input
            type="text"
            placeholder="Publication Date"
            className="w-full border-b border-gray-300 outline-none py-1"
            value={publicationDate}
            onChange={(e) => setPublicationDate(e.target.value)}
          />

          <div>
            <label className="block font-semibold mb-1">Authors</label>
            {authors.map((author, i) => (
              <div key={i} className="border p-3 rounded mb-3 bg-gray-50 relative">
                <input
                  className="w-full mb-2 border px-2 py-1"
                  placeholder="Name"
                  value={author.name}
                  onChange={(e) => handleAuthorChange(i, "name", e.target.value)}
                />
                <input
                  className="w-full mb-2 border px-2 py-1"
                  placeholder="Degree"
                  value={author.degree}
                  onChange={(e) => handleAuthorChange(i, "degree", e.target.value)}
                />
                <input
                  className="w-full mb-2 border px-2 py-1"
                  placeholder="Affiliation"
                  value={author.affiliation}
                  onChange={(e) => handleAuthorChange(i, "affiliation", e.target.value)}
                />
                <input
                  className="w-full border px-2 py-1"
                  placeholder="Title"
                  value={author.title}
                  onChange={(e) => handleAuthorChange(i, "title", e.target.value)}
                />
                {authors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAuthor(i)}
                    className="absolute top-2 right-2 text-red-500"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAuthor}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              + Add Author
            </button>
          </div>

          <input
            type="url"
            placeholder="Source URL"
            className="w-full border-b border-gray-300 outline-none py-1"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />

          <input
            type="file"
            className="w-full text-gray-700"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
