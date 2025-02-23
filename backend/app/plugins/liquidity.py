import requests

class LiquidityPlugin:
    def __init__(self):
        self.api_url = "https://api.geckoterminal.com/api/v2/networks"

    def fetch_liquidity_data(self, network: str, token_address: str) -> dict:
        try:
            # Map chain IDs to GeckoTerminal networks
            network_map = {"1": "eth", "56": "bsc", "137": "polygon"}
            network_name = network_map.get(network, "eth")
            response = requests.get(
                f"{self.api_url}/{network_name}/pools?query={token_address}"
            )
            response.raise_for_status()
            data = response.json()
            if data["data"]:
                pool = data["data"][0]
                return {
                    "liquidity_usd": float(pool["attributes"]["reserve_in_usd"]),
                    "volume_usd": float(pool["attributes"]["volume_usd"]["h24"])
                }
            return {"liquidity_usd": 1000000.0, "volume_usd": 50000.0}  # Fallback
        except Exception as e:
            print(f"Failed to fetch liquidity data: {e}")
            return {"liquidity_usd": 1000000.0, "volume_usd": 50000.0}  # Fallback

# Register plugin
plugin = LiquidityPlugin()