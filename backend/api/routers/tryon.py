"""
Virtual try-on router.

POST /api/v1/try-on
    Submit a model_id + garment_id to the Kling AI virtual try-on pipeline.
    Looks up locally saved images by ID, uploads to 0x0.st, and returns the result URL.
    Typical latency: 30–120 seconds.
"""

import json
import uuid
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core.exceptions import APIError, StorageError, TaskTimeoutError
from services.tryon_service import TryonService, VALID_GARMENT_TYPES

TRYON_REGISTRY = Path("data/tryon/tryon.json")

router = APIRouter()
_service = TryonService()


class TryonRequest(BaseModel):
    model_id: str = Field(
        ...,
        description="ID of the generated model (from /api/v1/generate-model response).",
        examples=["a5f40b41-d918-4e58-8fbd-563898031f5c"],
    )
    garment_id: str = Field(
        ...,
        description="ID of the generated garment (from /api/v1/generate-garment response).",
        examples=["ae27bdb2-5ea6-44d2-9cf3-f48197ec37e3"],
    )
    garment_type: str = Field(
        default="upper",
        description="Part of the body the garment covers: 'upper', 'lower', or 'overall'.",
        examples=["upper"],
    )


class TryonResponse(BaseModel):
    result_url: str = Field(description="Result image URL from PiAPI.")


@router.post(
    "/try-on",
    response_model=TryonResponse,
    summary="Virtual try-on",
    description=(
        "Looks up model and garment by ID, uploads their local images to 0x0.st, "
        "then submits to Kling AI virtual try-on (via PiAPI). "
        "Result is logged to data/tryon/tryon.json. "
        "Typical latency: 30–120 seconds."
    ),
)
async def try_on(request: TryonRequest) -> TryonResponse:
    if request.garment_type not in VALID_GARMENT_TYPES:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Invalid garment_type '{request.garment_type}'. "
                f"Supported values: {', '.join(sorted(VALID_GARMENT_TYPES))}"
            ),
        )

    try:
        result_url = await _service.run(
            user_id=uuid.uuid4().int >> 96,
            model_id=request.model_id,
            garment_id=request.garment_id,
            garment_type=request.garment_type,
        )
    except TaskTimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail=f"Try-on timed out after {exc.elapsed_seconds:.0f}s. Please try again.",
        ) from exc
    except APIError as exc:
        raise HTTPException(status_code=502, detail=exc.message) from exc
    except StorageError as exc:
        raise HTTPException(status_code=502, detail=exc.message) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return TryonResponse(result_url=result_url)


@router.get(
    "/try-on/{tryon_id}/download",
    summary="Download try-on result image",
    description="Fetches the result image by try-on ID and streams it as a file download.",
)
async def download_tryon(tryon_id: str):
    if not TRYON_REGISTRY.exists():
        raise HTTPException(status_code=404, detail="No try-on records found.")

    records = json.loads(TRYON_REGISTRY.read_text(encoding="utf-8"))
    record = next((r for r in records if r["id"] == tryon_id), None)
    if not record:
        raise HTTPException(status_code=404, detail=f"Try-on '{tryon_id}' not found.")

    result_url = record["result_url"]

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.get(result_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch result image.")

    ext = result_url.rsplit(".", 1)[-1].lower() or "png"
    filename = f"tryon-{tryon_id}.{ext}"

    return StreamingResponse(
        iter([resp.content]),
        media_type=f"image/{ext}",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
