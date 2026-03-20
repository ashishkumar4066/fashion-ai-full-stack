"""
Video generation router.

POST /api/v1/generate-video
    Submit a tryon_id to generate a fashion video from the try-on result image.
    Uses Kling AI via PiAPI (version 2.6, std mode, 5s) — $0.20/video.
    Typical latency: 60–180 seconds.

GET  /api/v1/videos
    List all generated video records.

GET  /api/v1/videos/{video_id}
    Get a single video record by ID.
"""

import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.exceptions import APIError, StorageError, TaskTimeoutError
from services.video_generator import (
    VideoGenerator,
    VALID_DURATIONS,
    VALID_ASPECT_RATIOS,
)

VIDEO_REGISTRY = Path("data/videos/video.json")

router   = APIRouter()
_service = VideoGenerator()


class VideoRequest(BaseModel):
    tryon_id: str = Field(
        ...,
        description="ID of the try-on result to animate (from /api/v1/try-on response).",
        examples=["a5f40b41-d918-4e58-8fbd-563898031f5c"],
    )
    prompt: Optional[str] = Field(
        default=None,
        description=(
            "Text prompt describing the desired motion/scene. "
            "Defaults to a generic fashion runway prompt if omitted."
        ),
        examples=["Fashion model walking on a modern runway, confident stride"],
    )
    duration: int = Field(
        default=5,
        description="Video duration in seconds. 5 (default, cheapest) or 10.",
        examples=[5],
    )
    aspect_ratio: str = Field(
        default="9:16",
        description="Output aspect ratio: '9:16' (mobile/reels), '16:9', or '1:1'.",
        examples=["9:16"],
    )


class VideoResponse(BaseModel):
    id: str
    tryon_id: str
    prompt: str
    duration: int
    aspect_ratio: str
    video_url: str
    file_path: str
    created_at: str


def _read_video_registry() -> list[dict]:
    if not VIDEO_REGISTRY.exists():
        return []
    return json.loads(VIDEO_REGISTRY.read_text(encoding="utf-8"))


@router.post(
    "/generate-video",
    response_model=VideoResponse,
    summary="Generate fashion video from try-on result",
    description=(
        "Animates a try-on result image into a short fashion video using Kling AI (PiAPI). "
        "Default settings use the cheapest available tier: version 2.6, std mode, 5 seconds, "
        "no audio — approximately $0.20 per video. "
        "The MP4 is saved to data/videos/ and the record is logged to data/videos/video.json. "
        "Typical latency: 60–180 seconds."
    ),
)
async def generate_video(request: VideoRequest) -> VideoResponse:
    if request.duration not in VALID_DURATIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid duration '{request.duration}'. Supported: {sorted(VALID_DURATIONS)}",
        )
    if request.aspect_ratio not in VALID_ASPECT_RATIOS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Invalid aspect_ratio '{request.aspect_ratio}'. "
                f"Supported: {', '.join(sorted(VALID_ASPECT_RATIOS))}"
            ),
        )

    try:
        record = await _service.run(
            tryon_id=request.tryon_id,
            prompt=request.prompt,
            duration=request.duration,
            aspect_ratio=request.aspect_ratio,
        )
    except TaskTimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail=f"Video generation timed out after {exc.elapsed_seconds:.0f}s. Please try again.",
        ) from exc
    except APIError as exc:
        raise HTTPException(status_code=502, detail=exc.message) from exc
    except StorageError as exc:
        raise HTTPException(status_code=502, detail=exc.message) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return VideoResponse(**record)


@router.get(
    "/videos",
    response_model=list[VideoResponse],
    summary="List all generated videos",
)
async def list_videos() -> list[VideoResponse]:
    return [VideoResponse(**r) for r in _read_video_registry()]


@router.get(
    "/videos/{video_id}",
    response_model=VideoResponse,
    summary="Get a video record by ID",
)
async def get_video(video_id: str) -> VideoResponse:
    record = next((r for r in _read_video_registry() if r["id"] == video_id), None)
    if not record:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found.")
    return VideoResponse(**record)
