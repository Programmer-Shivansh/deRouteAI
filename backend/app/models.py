from pydantic import BaseModel

class SwapRequest(BaseModel):
    from_chain: str
    to_chain: str
    from_token: str
    to_token: str
    amount: str
    preference: str

class SwapRoute(BaseModel):
    route: str
    estimated_gas_fee: float
    execution_time: float
    slippage: float
    guaranteed_rate: float