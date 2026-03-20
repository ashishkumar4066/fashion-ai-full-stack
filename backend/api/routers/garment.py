"""
Garment generation router.

POST /api/v1/generate-garment
    Generate a garment product image from a text prompt.
GET  /api/v1/garments
    List all generated garments.
GET  /api/v1/garments/{garment_id}
    Get a single garment record by ID.
"""

import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from core.exceptions import APIError, TaskTimeoutError
from services.garment_generator import VALID_ASPECT_RATIOS, GarmentGenerator

GARMENT_REGISTRY = Path("data/garment/garment.json")

router = APIRouter()
_generator = GarmentGenerator()


class GarmentRecord(BaseModel):
    id: str
    name: str
    prompt: str
    aspect_ratio: str
    file_path: str
    image_url: str
    created_at: str
    public_image_url: Optional[str] = None
    tryon_result_url: Optional[str] = None


def _read_garment_registry() -> list[dict]:
    if not GARMENT_REGISTRY.exists():
        return []
    return json.loads(GARMENT_REGISTRY.read_text(encoding="utf-8"))


class GenerateGarmentRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Description of the garment to generate.",
        examples=["blue denim jacket, front view", "red floral summer dress"],
    )
    aspect_ratio: str = Field(
        default="1:1",
        description="Image aspect ratio. '1:1' (square) recommended for product shots.",
        examples=["1:1", "4:5", "3:4"],
    )


class GenerateGarmentResponse(BaseModel):
    id: str = Field(description="Unique ID for this garment.")
    name: str = Field(description="Human-readable slug for this garment.")
    file_path: str = Field(description="Local path where the image was saved.")
    image_url: str = Field(description="Original image URL from PiAPI.")
    message: str = Field(default="Garment generated successfully.")


@router.post(
    "/generate-garment",
    response_model=GenerateGarmentResponse,
    summary="Generate a garment product image from a text prompt",
    description=(
        "Uses Gemini 2.5 Flash (via PiAPI) to generate a garment product image. "
        "The image is saved locally to data/garment/ and logged to data/garment/garment.json. "
        "Use the returned image_url as the garment_image_url input for the virtual try-on pipeline."
    ),
)
async def generate_garment(request: GenerateGarmentRequest) -> GenerateGarmentResponse:
    if request.aspect_ratio not in VALID_ASPECT_RATIOS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid aspect_ratio '{request.aspect_ratio}'. "
                   f"Supported values: {', '.join(sorted(VALID_ASPECT_RATIOS))}",
        )

    try:
        item_id, name, file_path, image_url = await _generator.generate(
            prompt=request.prompt,
            aspect_ratio=request.aspect_ratio,
        )
    except TaskTimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail=f"Garment generation timed out after {exc.elapsed_seconds:.0f}s. Please try again.",
        ) from exc
    except APIError as exc:
        raise HTTPException(status_code=502, detail=exc.message) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return GenerateGarmentResponse(
        id=item_id,
        name=name,
        file_path=file_path,
        image_url=image_url,
    )


@router.get(
    "/garments",
    response_model=list[GarmentRecord],
    summary="List all generated garments",
)
async def list_garments() -> list[GarmentRecord]:
    return [GarmentRecord(**r) for r in _read_garment_registry()]


@router.get(
    "/garments/{garment_id}",
    response_model=GarmentRecord,
    summary="Get a garment by ID",
)
async def get_garment(garment_id: str) -> GarmentRecord:
    record = next((r for r in _read_garment_registry() if r["id"] == garment_id), None)
    if not record:
        raise HTTPException(status_code=404, detail=f"Garment '{garment_id}' not found.")
    return GarmentRecord(**record)


@router.get(
    "/garments/{garment_id}/download",
    summary="Download a garment image",
    description="Streams the locally saved garment image as a file download.",
)
async def download_garment(garment_id: str) -> FileResponse:
    record = next((r for r in _read_garment_registry() if r["id"] == garment_id), None)
    if not record:
        raise HTTPException(status_code=404, detail=f"Garment '{garment_id}' not found.")

    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Garment image file not found on disk.")

    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        filename=f"garment-{garment_id}.jpg",
        headers={"Content-Disposition": f'attachment; filename="garment-{garment_id}.jpg"'},
    )
