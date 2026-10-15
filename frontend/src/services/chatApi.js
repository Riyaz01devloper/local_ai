/**
 * Chat persistence API — communicates with the backend /api/chat routes.
 * Chat history is stored in PostgreSQL via the backend.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Save a chat exchange (user message + AI response)
export async function saveChat(userId, message, response) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, message, response }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save chat: ${res.status}`);
  }

  return res.json();
}

// Fetch chat history for a user
// P0-6 fix: returns the data array directly — no double-unwrapping
export async function getChatHistory(userId) {
  const res = await fetch(`${API_URL}/chat/${userId}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch chat history: ${res.status}`);
  }

  const json = await res.json();
  // Backend returns { success: true, data: [...] }
  return Array.isArray(json.data) ? json.data : [];
}

// Clear all chat history for a user
export async function clearChatHistory(userId) {
  const res = await fetch(`${API_URL}/chat/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to clear chat history: ${res.status}`);
  }

  return res.json();
}