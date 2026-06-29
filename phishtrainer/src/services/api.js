const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return response.json();
}

export async function patchJson(path, data) {
  const response = await fetch(`${API_URL}${path}`, {
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return response.json();
}
