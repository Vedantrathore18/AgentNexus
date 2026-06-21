import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ethers } from "ethers";

const PORT = 3000;

// Mock Crypto Predictive AI Agent Processor
function processCryptoPrediction(topic: string, agentId: string) {
  if (agentId === "sentiment-v2") {
    return `Sentiment Analysis for ${topic}: 85% Positive among top Tier-1 accounts. Social volume up 400% in 24h.`;
  } else if (agentId === "arbitrage-bot") {
    return `Arbitrage opportunity found for ${topic} between DEX A and DEX B. Estimated spread: 1.2%.`;
  }

  // Simulating an AI processing payload for CryptoOracle-v9
  const predictions = [
    `The sentiment for ${topic} is highly bullish based on recent on-chain volume spikes. Key resistance is likely to break within 48h.`,
    `Our neural network indicates a 72% probability of a short-term correction for ${topic} before continuing its macro uptrend.`,
    `On-chain metrics for ${topic} show significant smart money accumulation. Expect high volatility soon.`,
    `Based on macro indicators, ${topic} is facing heavy resistance. Consider hedging short-term positions.`
  ];
  return predictions[Math.floor(Math.random() * predictions.length)];
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Use Avalanche Fuji Testnet RPC
  const avaxProvider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");

  // Endpoint: /api/v1/agent/analytics
  app.post("/api/v1/agent/analytics", async (req, res) => {
    try {
      const { txHash, topic, agentId } = req.body;

      let cost = "0.1 USDC";
      let destWallet = "0x8F9B932fFf0110EEAc81c109A12BEb151A6Cb2DF";
      
      if (agentId === "sentiment-v2") { 
        cost = "0.05 USDC"; 
        destWallet = "0x3A2B112fCe0110EFAc41c109A12BEb151A6Cb7AB"; 
      }
      if (agentId === "arbitrage-bot") { 
        cost = "0.25 USDC"; 
        destWallet = "0x111C932fFf0110EEAc81c109A12BEb151A6Cb999"; 
      }

      // 1. x402 Protocol Implementation: Check for transaction hash
      if (!txHash) {
        // Return strict HTTP Status Code 402 (Payment Required)
        return res.status(402).json({
          error: "Payment Required",
          protocol: "x402",
          cost: cost,
          destinationWallet: destWallet,
          message: "Please settle this micro-payment on the Avalanche Fuji C-Chain to unlock the autonomous agent prediction."
        });
      }

      // 2. Validate Transaction on Avalanche Fuji Testnet
      try {
        // We will simulate the check here but actually call ethers
        const tx = await avaxProvider.getTransaction(txHash);
        const txReceipt = await avaxProvider.getTransactionReceipt(txHash);
        
        // In this simulation, any valid string mock is treated as successful to show the UX,
        // but we verify if the hash format fits a 66 char hex length or if it resolves.
        // For hackathon completeness, we bypass strict real on-chain waiting 
        // to ensure the frontend demo is seamless, but we demonstrate the ethers setup.
        
        if (txHash.length !== 66 || !txHash.startsWith("0x")) {
          return res.status(400).json({ error: "Invalid transaction hash format." });
        }
        
      } catch(err) {
        // Ignore real validation errors for the sim if the transaction isn't actually broadcasted.
      }

      // 3. Bypass paywall after "confirmation", trigger AI
      const aiPayload = processCryptoPrediction(topic || "AVAX", agentId);

      // Return HTTP 200 with success status and payload
      return res.status(200).json({
        status: "success",
        data: {
            topic: topic || "AVAX",
            analysis: aiPayload,
            settledVia: "x402 (Avalanche Fuji)",
            timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
