// In-memory fallback cache for sessions when no external database is attached
const memoryStore = new Map();

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Extract user_id from path or query
  // Vercel path rewrites pass URL or req.query
  const urlParts = (req.url || "").split("?")[0].split("/").filter(Boolean);
  const pathUserId = urlParts[urlParts.length - 1] !== "chat" ? urlParts[urlParts.length - 1] : null;
  const userId = pathUserId || req.query?.user_id || "user_1";

  if (req.method === "POST") {
    try {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      const { user_id, message, response } = body || {};
      const targetUser = user_id || userId;

      if (!memoryStore.has(targetUser)) {
        memoryStore.set(targetUser, []);
      }
      const userChats = memoryStore.get(targetUser);
      userChats.push({
        id: Date.now(),
        user_id: targetUser,
        message,
        response,
        created_at: new Date().toISOString(),
      });
      // Keep last 50
      if (userChats.length > 50) userChats.shift();

      return res.status(200).json({ success: true, message: "Chat saved" });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === "GET") {
    const userChats = memoryStore.get(userId) || [];
    return res.status(200).json({ success: true, data: userChats });
  }

  if (req.method === "DELETE") {
    memoryStore.delete(userId);
    return res.status(200).json({ success: true, message: "Chat history cleared" });
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
};
