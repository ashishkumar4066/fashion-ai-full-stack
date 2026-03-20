"""
Garment generation router.

POST /api/v1/generate-garment
    Generate a garment product image from a text prompt.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.exceptions import APIError, TaskTimeoutError
from services.garment_generator import VALID_ASPECT_RATIOS, GarmentGenerator

router = APIRouter()
_generator = GarmentGenerator()


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
