/**
 * Chat persistence API — communicates with the backend /api/chat routes.
 * Supports transparent fallback to localStorage when offline or when DB is not configured.
 */

const API_URL = import.meta.env.VITE_API_URL || "/api";
const LOCAL_STORAGE_KEY_PREFIX = "resq_chat_history_";

function getLocalChats(userId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalChat(userId, message, response) {
  try {
    const chats = getLocalChats(userId);
    const newEntry = {
      id: Date.now(),
      user_id: userId,
      message,
      response,
      created_at: new Date().toISOString(),
    };
    chats.push(newEntry);
    if (chats.length > 50) chats.shift();
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(chats));
    return newEntry;
  } catch (e) {
    return null;
  }
}

function clearLocalChats(userId) {
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
  } catch (e) {
    // Ignore storage errors
  }
}

// Save a chat exchange (user message + AI response)
export async function saveChat(userId, message, response) {
  // Always mirror in localStorage for instantaneous offline availability
  saveLocalChat(userId, message, response);

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, message, response }),
    });

    if (!res.ok) {
      console.warn("Backend chat save failed, saved to local storage");
      return { success: true, localOnly: true };
    }

    return res.json();
  } catch (err) {
    // Graceful fallback to local storage
    return { success: true, localOnly: true };
  }
}

// Fetch chat history for a user
export async function getChatHistory(userId) {
  try {
    const res = await fetch(`${API_URL}/chat/${userId}`);

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote chat history, loading from local cache:", err.message);
  }

  // Fallback to local storage
  return getLocalChats(userId);
}

// Clear all chat history for a user
export async function clearChatHistory(userId) {
  clearLocalChats(userId);

  try {
    const res = await fetch(`${API_URL}/chat/${userId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      return { success: true, localOnly: true };
    }

    return res.json();
  } catch (err) {
    return { success: true, localOnly: true };
  }
}
