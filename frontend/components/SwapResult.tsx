import React from "react";
import { SwapRoute } from "@/types";

interface SwapResultProps {
  route: SwapRoute | null;
}

export const SwapResult: React.FC<SwapResultProps> = ({ route }) => {
  if (!route) return null;

  return (
    <div className="mt-6 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Optimized Swap Route</h3>
      <p><strong>Route:</strong> {route.route}</p>
      <p><strong>Estimated Gas Fee:</strong> {route.estimatedGasFee} Gwei</p>
      <p><strong>Execution Time:</strong> {route.executionTime} seconds</p>
      <p><strong>Slippage:</strong> {route.slippage}%</p>
      <p><strong>Guaranteed Rate:</strong> {route.guaranteedRate}</p>
    </div>
  );
};