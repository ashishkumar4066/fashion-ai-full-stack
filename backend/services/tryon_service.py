"""
Try-On Service — orchestrates the virtual try-on pipeline.

Accepts model_id + garment_id, looks up locally saved image files from the
JSON registries, uploads them to 0x0.st for stable public URLs, submits to
PiAPI Kling (ai_try_on), and logs the result to data/tryon/tryon.json.
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

MODEL_REGISTRY   = Path("data/model/model.json")
GARMENT_REGISTRY = Path("data/garment/garment.json")
TRYON_OUTPUT_DIR = Path("data/tryon")
TRYON_REGISTRY   = TRYON_OUTPUT_DIR / "tryon.json"

IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload"

PIAPI_MIN_DIMENSION = 512

logger = structlog.get_logger(__name__)

VALID_GARMENT_TYPES = {"upper", "lower", "overall"}

_GARMENT_FIELD_MAP = {
    "upper":   "upper_input",
    "lower":   "lower_input",
    "overall": "dress_input",
}


class TryonService:
    """Orchestrates the Kling AI virtual try-on pipeline."""

    def __init__(self, piapi_client: PiAPIClient | None = None) -> None:
        self._piapi = piapi_client or PiAPIClient()

    async def run(
        self,
        user_id: int,
        model_id: str,
        garment_id: str,
        garment_type: str = "upper",
    ) -> str:
        """Run the virtual try-on pipeline end to end.

        Args:
            user_id: Caller's user ID.
            model_id: ID of the generated model from data/model/model.json.
            garment_id: ID of the generated garment from data/garment/garment.json.
            garment_type: "upper", "lower", or "overall".

        Returns:
            Result image URL from PiAPI.

        Raises:
            ValueError: If IDs are not found or garment_type is invalid.
            StorageError: If uploading to 0x0.st fails.
            APIError: If the PiAPI task fails or returns no result URL.
            TaskTimeoutError: If polling exceeds the maximum wait time (~5 min).
        """
        if garment_type not in VALID_GARMENT_TYPES:
            raise ValueError(
                f"Invalid garment_type '{garment_type}'. "
                f"Supported: {', '.join(sorted(VALID_GARMENT_TYPES))}"
            )

        garment_field = _GARMENT_FIELD_MAP[garment_type]
        log = logger.bind(user_id=user_id, model_id=model_id, garment_id=garment_id)
        log.info("tryon_start")

        # 1. Look up local file paths from registries
        model_record   = self._lookup_record(MODEL_REGISTRY,   model_id,   "model")
        garment_record = self._lookup_record(GARMENT_REGISTRY, garment_id, "garment")

        # 2. Validate dimensions from local files before uploading
        self._check_local_dimensions(model_record["file_path"],   "model")
        self._check_local_dimensions(garment_record["file_path"], "garment")

        # 3. Upload local files to Catbox — stable public URLs for Kling
        model_url   = await self._upload_local_file(model_record["file_path"],   "model")
        garment_url = await self._upload_local_file(garment_record["file_path"], "garment")

        # 4. Submit to Kling AI
        input_payload = {
            "model_input": model_url,
            garment_field: garment_url,
            "batch_size":  1,
        }

        task_data = await self._piapi.create_and_poll(
            model="kling",
            task_type="ai_try_on",
            input_payload=input_payload,
            config={"service_mode": "public"},
        )

        result_url = self._extract_result_url(task_data)
        if not result_url:
            log.error("tryon_no_result_url", output=task_data.get("output"))
            raise APIError(
                "PiAPI returned a completed task but no result image URL was found."
            )

        log.info("tryon_complete", result_url=result_url)

        # 5. Download result image and save locally to data/tryon/
        tryon_id = str(uuid.uuid4())
        file_path = await self._download_result(result_url, tryon_id)
        log.info("tryon_result_saved", file_path=file_path)

        # 6. Log to tryon.json
        self._save_tryon_record(
            tryon_id=tryon_id,
            model_id=model_id,
            garment_id=garment_id,
            garment_type=garment_type,
            model_image_url=model_url,
            garment_image_url=garment_url,
            result_url=result_url,
            file_path=file_path,
        )

        # 7. Back-fill URLs into generator registries
        self._update_registry_by_id(MODEL_REGISTRY,   model_id,   model_url,   field="public_image_url")
        self._update_registry_by_id(GARMENT_REGISTRY, garment_id, garment_url, field="public_image_url")
        self._update_registry_by_id(MODEL_REGISTRY,   model_id,   result_url,  field="tryon_result_url")
        self._update_registry_by_id(GARMENT_REGISTRY, garment_id, result_url,  field="tryon_result_url")

        return result_url

    # ------------------------------------------------------------------ helpers

    @staticmethod
    def _lookup_record(registry_path: Path, item_id: str, label: str) -> dict:
        """Load registry JSON and return the record matching item_id.

        Raises ValueError if the registry is missing or the ID is not found.
        """
        if not registry_path.exists():
            raise ValueError(f"Registry for {label} not found. Generate a {label} first.")
        try:
            records: list = json.loads(registry_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            raise ValueError(f"Could not read {label} registry: {exc}") from exc

        for record in records:
            if record.get("id") == item_id:
                return record

        raise ValueError(f"{label.capitalize()} with id '{item_id}' not found.")

    async def _upload_local_file(self, file_path: str, label: str) -> str:
        """Read a locally saved image file and upload it to Catbox.

        Returns the stable public URL.
        Raises StorageError on read or upload failure.
        """
        path = Path(file_path)
        if not path.exists():
            raise StorageError(f"Local {label} image file not found: {file_path}")

        # Re-encode as clean JPEG — raw bytes from Gemini CDN may be WebP
        # or have non-standard headers that Kling AI's image processor rejects.
        img = Image.open(path).convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=95)
        image_bytes = buf.getvalue()

        log = logger.bind(label=label, file_path=file_path, size_bytes=len(image_bytes))
        log.info("upload_start")

        b64_image = base64.b64encode(image_bytes).decode("utf-8")

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    IMGBB_UPLOAD_URL,
                    params={"key": settings.IMGBB_API_KEY},
                    data={
                        "image": b64_image,
                        "name": path.stem,
                    },
                )
                resp.raise_for_status()
                result = resp.json()
        except httpx.HTTPStatusError as exc:
            raise StorageError(
                f"ImgBB upload failed ({exc.response.status_code}): {exc.response.text}"
            ) from exc
        except httpx.RequestError as exc:
            raise StorageError(f"Failed to connect to ImgBB: {exc}") from exc

        if not result.get("success"):
            raise StorageError(f"ImgBB upload failed: {result}")

        public_url = result["data"]["url"]

        log.info("upload_complete", public_url=public_url)
        return public_url

    @staticmethod
    def _check_local_dimensions(file_path: str, label: str) -> None:
        """Read local image file and verify both dimensions are >= 512px."""
        path = Path(file_path)
        if not path.exists():
            raise ValueError(f"{label.capitalize()} image file not found: {file_path}")

        img = Image.open(path)
        w, h = img.size
        if w < PIAPI_MIN_DIMENSION or h < PIAPI_MIN_DIMENSION:
            raise ValueError(
                f"{label.capitalize()} image is {w}×{h}px — "
                f"PiAPI requires at least {PIAPI_MIN_DIMENSION}px on both sides."
            )

    async def _download_result(self, result_url: str, tryon_id: str) -> str:
        """Download the Kling result image and save to data/tryon/{tryon_id}.jpg."""
        TRYON_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.get(result_url)
                resp.raise_for_status()
                image_bytes = resp.content
        except httpx.RequestError as exc:
            raise APIError(f"Failed to download try-on result: {exc}") from exc

        file_path = TRYON_OUTPUT_DIR / f"{tryon_id}.jpg"
        file_path.write_bytes(image_bytes)
        return str(file_path)

    @staticmethod
    def _save_tryon_record(
        tryon_id: str,
        model_id: str,
        garment_id: str,
        garment_type: str,
        model_image_url: str,
        garment_image_url: str,
        result_url: str,
        file_path: str,
    ) -> None:
        """Append a try-on result record to data/tryon/tryon.json."""
        TRYON_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        records: list = []
        if TRYON_REGISTRY.exists():
            try:
                records = json.loads(TRYON_REGISTRY.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                records = []

        records.append({
            "id":                tryon_id,
            "model_id":          model_id,
            "garment_id":        garment_id,
            "garment_type":      garment_type,
            "model_image_url":   model_image_url,
            "garment_image_url": garment_image_url,
            "result_url":        result_url,
            "file_path":         file_path,
            "created_at":        datetime.now(timezone.utc).isoformat(),
        })

        TRYON_REGISTRY.write_text(
            json.dumps(records, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    @staticmethod
    def _update_registry_by_id(
        registry_path: Path, item_id: str, value: str, field: str = "tryon_result_url"
    ) -> None:
        """Find the record by id and set the given field on it."""
        if not registry_path.exists():
            return
        try:
            records: list = json.loads(registry_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return

        updated = False
        for record in records:
            if record.get("id") == item_id:
                record[field] = value
                updated = True
                break

        if updated:
            registry_path.write_text(
                json.dumps(records, indent=2, ensure_ascii=False),
                encoding="utf-8",
            )

    def _extract_result_url(self, task_data: dict) -> str:
        """Extract result image URL from completed Kling ai_try_on task data."""
        works = task_data.get("output", {}).get("works", [])
        if not works:
            return ""
        image = works[0].get("image", {})
        return image.get("resource_without_watermark") or image.get("resource", "")
