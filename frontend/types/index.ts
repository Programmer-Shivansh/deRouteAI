export interface SwapRequest {
    fromChain: string;
    toChain: string;
    fromToken: string;
    toToken: string;
    amount: string;
    preference: "speed" | "cost";
  }
  
  export interface SwapRoute {
    route: string;
    estimatedGasFee: number;
    executionTime: number;
    slippage: number;
    guaranteedRate: number;
  }