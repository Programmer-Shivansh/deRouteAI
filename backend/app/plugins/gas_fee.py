import requests

class GasFeePlugin:
    def __init__(self):
        self.api_url = "https://api.blocknative.com/gasprices/blockprices"
        self.api_key = "YOUR_BLOCKNATIVE_API_KEY"  # Optional free-tier key

    def fetch_gas_fees(self, chain_id: str) -> float:
        try:
            headers = {"Authorization": self.api_key} if self.api_key else {}
            response = requests.get(f"{self.api_url}?chainid={chain_id}", headers=headers)
            response.raise_for_status()
            data = response.json()
            # Use 50% confidence level for average gas price
            gas_fee = data["blockPrices"][0]["estimatedPrices"][2]["price"]  # Gwei
            return gas_fee
        except Exception as e:
            print(f"Failed to fetch gas fees: {e}")
            return 50.0  # Fallback value

# Register plugin (ZerePy would load this dynamically)
plugin = GasFeePlugin()