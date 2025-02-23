import json
from typing import Dict
import os
from zerepy.src.agent import Agent  # Adjust path post-install
from .plugins.gas_fee import GasFeePlugin
from .plugins.liquidity import LiquidityPlugin

class AIRouter:
    def __init__(self):
        # Chain data with RPCs
        self.chains = {
            "1": {"name": "Ethereum", "rpc": "https://mainnet.infura.io/v3/YOUR_INFURA_KEY"},
            "56": {"name": "BSC", "rpc": "https://bsc-dataseed.binance.org/"},
            "137": {"name": "Polygon", "rpc": "https://polygon-rpc.com/"},
        }

        # Initialize Goat plugins
        self.gas_fee_plugin = GasFeePlugin()
        self.liquidity_plugin = LiquidityPlugin()

        # Ensure agent config exists
        os.makedirs("app/config", exist_ok=True)
        if not os.path.exists("app/config/swap_agent.json"):
            raise FileNotFoundError("swap_agent.json not found. Please create it.")

        # Initialize ZerePy agent
        self.agent = Agent("app/config/swap_agent.json")
        self.agent.load()

    def analyze_route(self, request: Dict) -> Dict:
        from_chain = self.chains[request["from_chain"]]
        to_chain = self.chains[request["to_chain"]]

        # Fetch real-time data using Goat plugins
        from_gas_fee = self.gas_fee_plugin.fetch_gas_fees(request["from_chain"])
        to_gas_fee = self.gas_fee_plugin.fetch_gas_fees(request["to_chain"])
        from_liquidity = self.liquidity_plugin.fetch_liquidity_data(request["from_chain"], request["from_token"])
        to_liquidity = self.liquidity_plugin.fetch_liquidity_data(request["to_chain"], request["to_token"])

        # Prepare prompt for AI agent
        prompt = (
            f"Optimize a cross-chain swap from {from_chain['name']} to {to_chain['name']}.\n"
            f"Amount: {request['amount']} tokens\n"
            f"User preference: {request['preference']}\n"
            f"From chain: gas fee {from_gas_fee} Gwei, liquidity {from_liquidity['liquidity_usd']} USD\n"
            f"To chain: gas fee {to_gas_fee} Gwei, liquidity {to_liquidity['liquidity_usd']} USD\n"
            f"Provide a route with estimated gas fee, execution time, slippage, and guaranteed rate."
        )

        # Use ZerePy agent with Hugging Face free tier
        try:
            response = self.agent.process(prompt)
            result = json.loads(response) if isinstance(response, str) else response
        except Exception as e:
            print(f"ZerePy agent failed: {e}, falling back to mock logic")
            result = self._mock_analyze_route(request, from_gas_fee, to_gas_fee, from_liquidity, to_liquidity)

        return {
            "route": result.get("route", f"{from_chain['name']} -> {to_chain['name']}"),
            "estimated_gas_fee": float(result.get("estimated_gas_fee", from_gas_fee + to_gas_fee)),
            "execution_time": float(result.get("execution_time", 10)),
            "slippage": float(result.get("slippage", 0.5)),
            "guaranteed_rate": float(result.get("guaranteed_rate", float(request["amount"]) * 0.995)),
        }

    def _mock_analyze_route(self, request: Dict, from_gas_fee: float, to_gas_fee: float, from_liquidity: Dict, to_liquidity: Dict) -> Dict:
        gas_fee = from_gas_fee + to_gas_fee
        execution_time = 10 if request["preference"] == "speed" else 20
        slippage = 0.5 if from_liquidity["liquidity_usd"] < 500000 else 0.2
        guaranteed_rate = float(request["amount"]) * (1 - slippage / 100)

        if request["preference"] == "cost":
            gas_fee *= 0.8
        else:
            execution_time *= 0.5

        return {
            "route": f"{self.chains[request['from_chain']]['name']} -> {self.chains[request['to_chain']]['name']}",
            "estimated_gas_fee": gas_fee,
            "execution_time": execution_time,
            "slippage": slippage,
            "guaranteed_rate": guaranteed_rate,
        }

ai_router = AIRouter()