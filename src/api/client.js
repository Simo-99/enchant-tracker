const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errData = await response.json();
      if (errData && errData.message) {
        errorMessage = errData.message;
      }
    } catch (_) {
      // Fallback to default message if response body is not JSON
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content or empty bodies gracefully
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
