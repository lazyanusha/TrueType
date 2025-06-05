const API_BASE = "http://localhost:8000/resources";

// Fetch all uploaded resources
export async function fetchResources(token: string) {
  const res = await fetch(`${API_BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch resources");
  return res.json();
}

// Upload a new resource (including file, title, authors, description, and source_url)
export async function uploadResource(formData: FormData, token: string) {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}` // Don't set Content-Type; FormData handles it
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload resource");
  return res.json();
}

// Update resource info (excluding file upload)
export async function updateResource(
  id: number,
  data: {
    title: string;
    description: string;
    authors: string[];
    source_url: string;
  },
  token: string
) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update resource");
  return res.json();
}

// Delete a resource
export async function deleteResource(id: number, token: string) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete resource");
  return res.json();
}
