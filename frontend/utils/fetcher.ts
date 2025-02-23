import axios from "axios";
import { SwapRequest, SwapRoute } from "../types";
export const fetchOptimizedRoute = async (data: SwapRequest): Promise<SwapRoute> => {
  const response = await axios.post("http://localhost:8000/optimize-route", data);
  return response.data;
};