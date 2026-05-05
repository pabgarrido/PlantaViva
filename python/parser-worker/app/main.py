"""Parser Worker — FastAPI entry point."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI

from .telemetry import setup_telemetry
from .routers import health
from .routers import parse


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:  # noqa: ARG001
    setup_telemetry()
    yield


app = FastAPI(
    title="PlantaViva Parser Worker",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(health.router)
app.include_router(parse.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": "parser-worker", "status": "ok"}
