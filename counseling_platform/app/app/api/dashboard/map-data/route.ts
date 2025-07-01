// This API route is no longer needed as all map data fetching is now handled client-side using Supabase client SDK.
// You can safely delete this file or leave a comment for future reference.

export default function handler(req, res) {
  res.status(410).json({ error: "This endpoint is deprecated. Use Supabase client SDK on the client for map data." });
}
