import { Message } from "@debridge-finance/desdk/lib/evm/send";
import { SendAutoParams } from "@debridge-finance/desdk/lib/evm/structs";
import { Context } from "@debridge-finance/desdk/lib/evm/context";
import { Flags } from "@debridge-finance/desdk/lib/evm/structs"; // Import Flags
import { ethers, utils } from "ethers"; // Import utils for v5 compatibility

// Extend Window interface for MetaMask provider (simplified for v5)
declare global {
  interface Window {
    ethereum?: any; // ethers v5 Web3Provider handles EIP-1193 internally
  }
}

// deBridgeGate ABI (minimal subset for `send` and `globalFixedNativeFee`)
const DEBRIDGE_GATE_ABI = [
  "function send(address token, uint256 amount, uint256 chainIdTo, bytes receiver, bytes permit, bool useAssetFee, uint256 referralCode, tuple(uint256 executionFee, address fallbackAddress, uint256 flags, bytes data) autoParams) external payable",
  "function globalFixedNativeFee() external view returns (uint256)",
];

// deBridgeGate contract address (mainnet Ethereum, replace with testnet if needed)
const DEBRIDGE_GATE_ADDRESS = "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA";

// Get the provider from the browser (MetaMask)
const getProvider = (): ethers.providers.Web3Provider => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  throw new Error("No wallet provider found. Please install MetaMask.");
};

// Function to execute a cross-chain swap
export const executeCrossChainSwap = async (
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string,
  amount: string
) => {
  try {
    // Get provider and signer
    const provider = getProvider();
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    // Define the EVM context for the origin chain
    const evmOriginContext: Context = {
      provider: provider, // Web3Provider is compatible with ethers v5
    };

    // Create the cross-chain message
    const message = new Message({
      tokenAddress: fromToken, // e.g., "0x000..." for ETH
      amount: utils.parseUnits(amount, 18), // Use utils.parseUnits
      chainIdTo: toChain, // e.g., "137" for Polygon
      receiver: utils.hexlify(utils.toUtf8Bytes(userAddress)), // Use utils for hexlify and toUtf8Bytes
      permit: "0x", // No permit for simplicity (optional)
      useAssetFee: false, // Use native fee (ETH)
      referralCode: 0, // Optional referral code
      autoParams: new SendAutoParams({
        executionFee: "0", // No additional execution fee
        fallbackAddress: userAddress, // Fallback to sender
        flags: new Flags(), // Use Flags class from deBridge SDK
        data: "0x", // No additional call data
      }),
    });

    // Get encoded arguments for deBridgeGate.send()
    const argsForSend = message.getEncodedArgs();

    // Initialize deBridgeGate contract
    const deBridgeGate = new ethers.Contract(DEBRIDGE_GATE_ADDRESS, DEBRIDGE_GATE_ABI, signer);

    // Get the global fixed native fee
    const fee = await deBridgeGate.globalFixedNativeFee();
    const etherToSend = fee.add(utils.parseUnits(amount, 18)); // Use utils.parseUnits

    // Send the cross-chain transaction
    const tx = await deBridgeGate.send(...argsForSend, {
      value: etherToSend,
      gasLimit: 300000, // Adjust based on network
    });

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    return receipt;
  } catch (error) {
    console.error("Failed to execute cross-chain swap:", error);
    throw error;
  }
};

// Optional: Function to check submission status
export const checkSubmissionStatus = async (transactionHash: string) => {
  const provider = getProvider();
  const evmOriginContext: Context = { provider };

  const submissions = await import("@debridge-finance/desdk/lib/evm/submission").then(
    (module) => module.Submission.findAll(transactionHash, evmOriginContext)
  );

  const [submission] = submissions;
  if (!submission) throw new Error("No submission found");

  const isConfirmed = await submission.hasRequiredBlockConfirmations();
  console.log("Submission confirmed:", isConfirmed);
  console.log("Asset ID:", submission.debridgeId);
  console.log("Amount transferred to:", submission.amount, submission.receiver);

  return { isConfirmed, submission };
};