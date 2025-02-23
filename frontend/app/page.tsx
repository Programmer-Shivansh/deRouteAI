"use client";

import React, { useState } from "react";
import { SwapForm } from "@/components/SwapForm";
import { SwapResult } from "@/components/SwapResult";
import { SwapRequest, SwapRoute } from "@/types";
import { fetchOptimizedRoute } from "@/utils/fetcher";
import { executeCrossChainSwap } from "@/lib/debridge";

export default function Home() {
  const [route, setRoute] = useState<SwapRoute | null>(null);

  const handleSwap = async (data: SwapRequest) => {
    try {
      // Fetch optimized route from backend
      const optimizedRoute = await fetchOptimizedRoute(data);
      setRoute(optimizedRoute);

      // Execute swap via deBridge
      const receipt = await executeCrossChainSwap(
        data.fromChain,
        data.toChain,
        data.fromToken,
        data.toToken,
        data.amount
      );
      console.log("Swap executed successfully:", receipt);
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">AI-Powered Cross-Chain Liquidity Router</h1>
      <SwapForm onSubmit={handleSwap} />
      <SwapResult route={route} />
    </div>
  );
}