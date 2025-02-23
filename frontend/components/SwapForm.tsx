import React, { useState } from "react";
import { SwapRequest } from "@/types";

interface SwapFormProps {
  onSubmit: (data: SwapRequest) => void;
}
const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    }
  };
export const SwapForm: React.FC<SwapFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<SwapRequest>({
    fromChain: "1", // Ethereum
    toChain: "137", // Polygon
    fromToken: "0x0000000000000000000000000000000000000000", // ETH (zero address)
    toToken: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",   // MATIC on Polygon
    amount: "",
    preference: "speed",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Cross-Chain Swap</h2>
      <div className="mb-4">
        <label className="block text-gray-700">From Chain</label>
        <select name="fromChain" value={formData.fromChain} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="1">Ethereum</option>
          <option value="56">BSC</option>
          <option value="137">Polygon</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">To Chain</label>
        <select name="toChain" value={formData.toChain} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="1">Ethereum</option>
          <option value="56">BSC</option>
          <option value="137">Polygon</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">From Token Address</label>
        <input
          type="text"
          name="fromToken"
          value={formData.fromToken}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="e.g., 0x000..."
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">To Token Address</label>
        <input
          type="text"
          name="toToken"
          value={formData.toToken}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="e.g., 0x7D1..."
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Amount</label>
        <input
          type="text"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Preference</label>
        <select name="preference" value={formData.preference} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="speed">Speed</option>
          <option value="cost">Cost</option>
        </select>
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Optimize & Swap
      </button>
    </form>
  );
};