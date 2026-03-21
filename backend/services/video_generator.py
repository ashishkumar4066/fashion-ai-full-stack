"""
Video Generator — generates fashion videos from try-on result images.

Accepts a tryon_id, looks up the result image URL from data/tryon/tryon.json,
submits to PiAPI Kling video_generation, downloads the MP4, and logs the
result to data/videos/video.json.

Cheapest config: version 2.6, mode std, duration 5s, no audio → $0.20/video.
"""

import base64
import io
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

import httpx
import structlog
from PIL import Image

from clients.piapi_client import PiAPIClient
from core.config import settings
from core.exceptions import APIError, StorageError

VIDEO_OUTPUT_DIR = Path("data/videos")
VIDEO_REGISTRY   = VIDEO_OUTPUT_DIR / "video.json"

IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload"

TRYON_REGISTRY = Path("data/tryon/tryon.json")

DEFAULT_FASHION_PROMPT = (
    "Fashion model walking confidently on runway, smooth motion, "
    "professional lighting, high quality fashion video"
)

VALID_DURATIONS       = {5, 10}
VALID_ASPECT_RATIOS   = {"16:9", "9:16", "1:1"}

logger = structlog.get_logger(__name__)


class VideoGenerator:
    """Orchestrates Kling AI video generation from a try-on result image."""

    def __init__(self, piapi_client: PiAPIClient | None = None) -> None:
        self._piapi = piapi_client or PiAPIClient()

    async def run(
        self,
        tryon_id: str,
        prompt: str | None = None,
        duration: int = 5,
        aspect_ratio: str = "9:16",
    ) -> dict:
        """Generate a video from a try-on result image.

        Args:
            tryon_id: ID of the try-on result (from data/tryon/tryon.json).
            prompt: Text prompt describing the desired motion/scene.
                    Defaults to a generic fashion runway prompt.
            duration: Video duration in seconds — 5 or 10 (default 5, cheapest).
            aspect_ratio: "9:16" | "16:9" | "1:1" (default "9:16" for mobile/reels).

        Returns:
            Video record dict with id, tryon_id, video_url, file_path, created_at.

        Raises:
            ValueError: If tryon_id not found or invalid duration/aspect_ratio.
            APIError: If PiAPI task fails or returns no video URL.
            StorageError: If the MP4 download fails.
            TaskTimeoutError: If polling exceeds ~5 minutes.
        """
        if duration not in VALID_DURATIONS:
            raise ValueError(
                f"Invalid duration '{duration}'. Supported: {sorted(VALID_DURATIONS)}"
            )
        if aspect_ratio not in VALID_ASPECT_RATIOS:
            raise ValueError(
                f"Invalid aspect_ratio '{aspect_ratio}'. "
                f"Supported: {', '.join(sorted(VALID_ASPECT_RATIOS))}"
            )

        log = logger.bind(tryon_id=tryon_id, duration=duration, aspect_ratio=aspect_ratio)
        log.info("video_generation_start")

        # 1. Lookup tryon record and upload local file to ImgBB for a clean public URL.
        # The result_url stored in tryon.json is a Kling CDN URL ending in ".origin"
        # which Kling rejects as video input. Using the locally saved file avoids this.
        tryon_record = self._lookup_tryon(tryon_id)
        image_url = await self._upload_to_imgbb(tryon_record["file_path"])

        effective_prompt = prompt or DEFAULT_FASHION_PROMPT
        log.info("video_submitting", image_url=image_url, prompt=effective_prompt)

        # 2. Submit to Kling AI — cheapest settings: version 2.6, std, 5s, no audio
        input_payload = {
            "image_url":    image_url,
            "prompt":       effective_prompt,
            "negative_prompt": "",
            "cfg_scale":    0.5,
            "duration":     duration,
            "aspect_ratio": aspect_ratio,
            "mode":         "std",      # std = half price vs pro
        }

        task_data = await self._piapi.create_and_poll(
            model="kling",
            task_type="video_generation",
            input_payload=input_payload,
            config={"service_mode": "public"},
        )

        video_url = task_data.get("output", {}).get("video_url", "")
        if not video_url:
            log.error("video_no_url", output=task_data.get("output"))
            raise APIError(
                "PiAPI returned a completed task but no video URL was found."
            )

        log.info("video_generation_complete", video_url=video_url)

        # 3. Download the MP4 and save locally
        video_id  = str(uuid.uuid4())
        file_path = await self._download_video(video_url, video_id)
        log.info("video_saved", file_path=file_path)

        # 4. Persist record
        record = self._save_video_record(
            video_id=video_id,
            tryon_id=tryon_id,
            prompt=effective_prompt,
            duration=duration,
            aspect_ratio=aspect_ratio,
            video_url=video_url,
            file_path=file_path,
        )

        return record

    # ------------------------------------------------------------------ helpers

    async def _upload_to_imgbb(self, file_path: str) -> str:
        """Re-encode the local tryon image as JPEG and upload to ImgBB.

        Returns a stable public URL suitable for Kling AI input.
        Raises StorageError if the file is missing or the upload fails.
        """
        path = Path(file_path)
        if not path.exists():
            raise StorageError(f"Local tryon image not found: {file_path}")

        img = Image.open(path).convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=95)
        b64 = base64.b64encode(buf.getvalue()).decode()

        logger.info("imgbb_upload_start", file_path=file_path)
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                IMGBB_UPLOAD_URL,
                params={"key": settings.IMGBB_API_KEY},
                data={"image": b64, "name": path.stem},
            )
            resp.raise_for_status()
            result = resp.json()

        if not result.get("success"):
            raise StorageError(f"ImgBB upload failed: {result}")

        public_url = result["data"]["url"]
        logger.info("imgbb_upload_complete", public_url=public_url)
        return public_url

    @staticmethod
    def _lookup_tryon(tryon_id: str) -> dict:
        """Return the tryon record matching tryon_id from data/tryon/tryon.json."""
        if not TRYON_REGISTRY.exists():
            raise ValueError("No try-on records found. Run a try-on first.")
        try:
            records: list = json.loads(TRYON_REGISTRY.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            raise ValueError(f"Could not read try-on registry: {exc}") from exc

        for record in records:
            if record.get("id") == tryon_id:
                return record

        raise ValueError(f"Try-on with id '{tryon_id}' not found.")

    async def _download_video(self, video_url: str, video_id: str) -> str:
        """Download the Kling video MP4 and save to data/videos/{video_id}.mp4."""
        VIDEO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.get(video_url)
                resp.raise_for_status()
                video_bytes = resp.content
        except httpx.RequestError as exc:
            raise StorageError(f"Failed to download video: {exc}") from exc
        except httpx.HTTPStatusError as exc:
            raise StorageError(
                f"Video download returned {exc.response.status_code}"
            ) from exc

        file_path = VIDEO_OUTPUT_DIR / f"{video_id}.mp4"
        file_path.write_bytes(video_bytes)
        return str(file_path)

    @staticmethod
    def _save_video_record(
        video_id: str,
        tryon_id: str,
        prompt: str,
        duration: int,
        aspect_ratio: str,
        video_url: str,
        file_path: str,
    ) -> dict:
        """Append the video record to data/videos/video.json and return it."""
        VIDEO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        records: list = []
        if VIDEO_REGISTRY.exists():
            try:
                records = json.loads(VIDEO_REGISTRY.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                records = []

        record = {
            "id":           video_id,
            "tryon_id":     tryon_id,
            "prompt":       prompt,
            "duration":     duration,
            "aspect_ratio": aspect_ratio,
            "video_url":    video_url,
            "file_path":    file_path,
            "created_at":   datetime.now(timezone.utc).isoformat(),
        }
        records.append(record)

        VIDEO_REGISTRY.write_text(
            json.dumps(records, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return record
