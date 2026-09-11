export default async function handler(req, res) {
  const allowedOrigins = [
    "https://paperchickensolana-ux.github.io",
    "https://chicken-game-brown.vercel.app"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "POST uniquement"
    });
  }

  const { wallet, coins } = req.body || {};

  if (!wallet || typeof wallet !== "string") {
    return res.status(400).json({
      success: false,
      error: "Wallet manquant"
    });
  }

  if (typeof coins !== "number" || coins < 30) {
    return res.status(400).json({
      success: false,
      error: "Il faut au moins 30 SOL coins"
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(500).json({
      success: false,
      error: "Configuration Supabase manquante"
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/reserve_chicken_claim`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseSecretKey
        },
        body: JSON.stringify({
          p_wallet: wallet
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Supabase error:", data);

      return res.status(500).json({
        success: false,
        error: "Erreur Supabase"
      });
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result || result.allowed !== true) {
      return res.status(429).json({
        success: false,
        error: "Claim déjà effectué dans les dernières 24 heures",
        reason: result?.reason || "cooldown_24h"
      });
    }

    return res.status(200).json({
      success: true,
      wallet,
      reward: 1000,
      claimId: result.claim_id,
      status: "pending",
      payoutEnabled: false,
      message: "Claim réservé dans Supabase"
    });

  } catch (error) {
    console.error("Claim API error:", error);

    return res.status(500).json({
      success: false,
      error: "Erreur serveur"
    });
  }
}
