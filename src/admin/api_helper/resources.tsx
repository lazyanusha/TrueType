const BASE_URL = "http://localhost:8000/api/resources";

export async function fetchResources(token: string) {
  const res = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch resources");
  }
  return await res.json();
}

export async function uploadResource(data: FormData, token: string) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // no Content-Type here
    body: data,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to upload resource");
  }
  return await res.json();
}

export async function updateResource(id: number, data: any, token: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update resource");
  }
  return await res.json();
}

export async function deleteResource(id: number, token: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete resource");
  }
  return await res.json();
}
