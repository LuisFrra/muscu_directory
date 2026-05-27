// ═══════════════════════════════════════════════════════════
// api/exercises.js — Proxy backend vers ExerciseDB (RapidAPI)
// La clé API reste ici, côté serveur, jamais exposée au client.
// ═══════════════════════════════════════════════════════════
 
export default async function handler(req, res) {
  // ── CORS : autorise ton frontend à appeler ce endpoint ──
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
 
  if (req.method === "OPTIONS") return res.status(200).end();
 
  // ── Récupère le nom de l'exercice depuis la query string ──
  // Ex : /api/exercises?name=bench+press
  const { name } = req.query;
 
  if (!name) {
    return res.status(400).json({ error: "Paramètre 'name' manquant." });
  }
 
  try {
    // ── Appel vers ExerciseDB ──
    const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(name)}?limit=1&offset=0`;
 
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "exercisedb.p.rapidapi.com",
        // 🔑 La clé est lue depuis une variable d'environnement Vercel
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    });
 
    if (!response.ok) {
      return res.status(response.status).json({ error: "Erreur ExerciseDB", status: response.status });
    }
 
    const data = await response.json();
 
    // ── Retourne uniquement ce dont le frontend a besoin ──
    if (!data || data.length === 0) {
      return res.status(404).json({ gifUrl: null });
    }
 
    return res.status(200).json({ gifUrl: data[0].gifUrl });
 
  } catch (err) {
    console.error("Erreur proxy ExerciseDB :", err);
    return res.status(500).json({ error: "Erreur serveur interne." });
  }
}