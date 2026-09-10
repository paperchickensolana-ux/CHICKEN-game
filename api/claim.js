export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "POST uniquement"
    });
  }

  const { wallet, coins } = req.body || {};

  if (!wallet) {
    return res.status(400).json({
      success: false,
      error: "Wallet manquant"
    });
  }

  if (!coins || coins < 30) {
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
    message: "CHICKEN claim API fonctionne"
  });
}
