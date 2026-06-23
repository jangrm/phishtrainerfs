const API_URL = 'http://localhost:3001';

export async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return response.json();
}
