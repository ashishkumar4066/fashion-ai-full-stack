"""
Model Generator service — generates photorealistic human model images from a text prompt.

Uses Gemini 2.5 Flash via PiAPI. Generated images are saved locally to data/model/.
A JSON record for each generation is appended to data/model/model.json.
The output image URL can be passed directly to TryOnService as the person_image input.

Usage:
    generator = ModelGenerator()
    id, name, file_path, image_url = await generator.generate(
        prompt="young Indian male, casual standing pose",
        aspect_ratio="2:3",
    )
"""

import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

import httpx
import structlog

from clients.piapi_client import PiAPIClient
from core.exceptions import APIError

logger = structlog.get_logger(__name__)

MODEL_OUTPUT_DIR = Path("data/model")
MODEL_REGISTRY   = MODEL_OUTPUT_DIR / "model.json"

PROMPT_PREFIX = (
    "photorealistic fashion model, full body, plain white studio background, "
    "professional fashion photography, high quality, sharp focus, "
)

VALID_ASPECT_RATIOS = {
    "21:9", "1:1", "4:3", "3:2", "2:3", "5:4", "4:5", "3:4", "16:9", "9:16"
}


def _make_name(prompt: str, uid: str) -> str:
    """Generate a human-readable slug: first 4 words of prompt + first 8 chars of UUID."""
    words = re.sub(r"[^a-z0-9 ]", "", prompt.lower()).split()
    slug = "-".join(words[:4]) if words else "model"
    return f"{slug}-{uid[:8]}"


class ModelGenerator:
    """Generates photorealistic human model images from a text prompt."""

    def __init__(self, piapi_client: PiAPIClient | None = None) -> None:
        self._client = piapi_client or PiAPIClient()

    async def generate(
        self,
        prompt: str,
        aspect_ratio: str = "2:3",
    ) -> tuple[str, str, str, str]:
        """Generate a human model image from a text prompt.

        Returns:
            Tuple of (id, name, local_file_path, piapi_image_url).

        Raises:
            ValueError: If aspect_ratio is not supported.
            APIError: If image generation fails.
        """
        if aspect_ratio not in VALID_ASPECT_RATIOS:
            raise ValueError(
                f"Invalid aspect_ratio '{aspect_ratio}'. "
                f"Supported: {', '.join(sorted(VALID_ASPECT_RATIOS))}"
            )

        item_id     = str(uuid.uuid4())
        item_name   = _make_name(prompt, item_id)
        full_prompt = PROMPT_PREFIX + prompt.strip()

        log = logger.bind(id=item_id, name=item_name, prompt_preview=prompt[:60])
        log.info("model_generation_start")

        task_data = await self._client.create_and_poll(
            model="gemini",
            task_type="gemini-2.5-flash-image",
            input_payload={
                "prompt": full_prompt,
                "aspect_ratio": aspect_ratio,
                "output_format": "jpeg",
            },
        )

        output = task_data.get("output", {})
        image_url: str = output.get("image_url") or (
            output.get("image_urls") or [None]
        )[0]

        if not image_url:
            raise APIError("PiAPI returned no image URL in task output.")

        log.info("model_generation_complete", image_url=image_url)

        image_bytes = await self._download_image(image_url)
        file_path   = self._save_image(image_bytes, item_id)
        self._append_record(item_id, item_name, prompt, aspect_ratio, file_path, image_url)

        log.info("model_image_saved", file_path=file_path)
        return item_id, item_name, file_path, image_url

    async def _download_image(self, url: str) -> bytes:
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.content
        except httpx.RequestError as exc:
            raise APIError(f"Failed to download generated image: {exc}") from exc

    def _save_image(self, image_bytes: bytes, item_id: str) -> str:
        MODEL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        file_path = MODEL_OUTPUT_DIR / f"{item_id}.jpg"
        file_path.write_bytes(image_bytes)
        return str(file_path)

    def _append_record(
        self,
        item_id: str,
        name: str,
        prompt: str,
        aspect_ratio: str,
        file_path: str,
        image_url: str,
    ) -> None:
        records: list = []
        if MODEL_REGISTRY.exists():
            try:
                records = json.loads(MODEL_REGISTRY.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                records = []

        records.append({
            "id":           item_id,
            "name":         name,
            "prompt":       prompt,
            "aspect_ratio": aspect_ratio,
            "file_path":    file_path,
            "image_url":    image_url,
            "created_at":   datetime.now(timezone.utc).isoformat(),
        })

        MODEL_REGISTRY.write_text(
            json.dumps(records, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
