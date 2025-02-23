from fastapi import FastAPI
from app.models import SwapRequest, SwapRoute
from app.ai_router import ai_router

app = FastAPI()

@app.post("/optimize-route", response_model=SwapRoute)
async def optimize_route(request: SwapRequest):
    route_data = ai_router.analyze_route(request.dict())
    return SwapRoute(**route_data)