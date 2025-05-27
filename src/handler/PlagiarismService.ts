export async function checkPlagiarism(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to check plagiarism");
  }

  const resultData = await response.json();
  return resultData;
}
