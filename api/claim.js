export default function handler(req, res) {
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

  return res.status(200).json({
    success: true,
    wallet: wallet,
    coins: coins,
    reward: 1000,
    payoutEnabled: false,
    message: "CHICKEN claim API fonctionne"
  });
}
