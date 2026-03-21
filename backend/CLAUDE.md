# CLAUDE.md — fashion-ai

AI Fashion Virtual Try-On Bot for Telegram. Users upload a person photo + garment photo and get back AI-generated model photos and videos via Kling AI (PiAPI).

**Stack:** Python 3.11, FastAPI, python-telegram-bot 21.x, Celery, Redis, Cloudflare R2, PiAPI/Kling/Gemini, ImgBB, rembg, Pillow, pydantic-settings, structlog, httpx

**Setup:**
```bash
pip install -r requirements.txt
pip install python-magic-bin  # Windows only

uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Components

### Component 1 — Image Processor ✅
Validates and normalizes input images before sending to the AI pipeline.
- Input: raw image bytes + filename
- Output: validated bytes, resized JPEG bytes, background-removed PNG bytes, base64 string
- Approach: `python-magic` for mime detection (never trust extension); Pillow for resize + RGB conversion; rembg U2Net for background removal (garment only); all async via `asyncio.to_thread()`
- File: `services/image_processor.py`

### Component 2 — Model Generator ✅
Generates a photorealistic human model image from a text prompt.
- Input: prompt string (e.g. "young Indian male, casual pose"), aspect_ratio (default "2:3")
- Output: `(id, name, file_path, image_url)` — unique UUID, human-readable slug, local path `data/model/{uuid}.jpg`, PiAPI image URL; record appended to `data/model/model.json`
- Approach: Gemini 2.5 Flash via PiAPI (`model="gemini"`, `task_type="gemini-2.5-flash-image"`); auto-prepends fashion-context prefix to prompt; downloads and saves image locally
- File: `services/model_generator.py`
- API: `POST /api/v1/generate-model` → `{id, name, file_path, image_url}`

### Component 2b — Garment Generator ✅
Generates a garment product image from a text prompt.
- Input: prompt string (e.g. "blue denim jacket, front view"), aspect_ratio (default "1:1")
- Output: `(id, name, file_path, image_url)` — unique UUID, human-readable slug, local path `data/garment/{uuid}.jpg`, PiAPI image URL; record appended to `data/garment/garment.json`
- Approach: same as Model Generator; uses product-photography prompt prefix (flat lay, white background, no model); saves to `data/garment/`
- File: `services/garment_generator.py`
- API: `POST /api/v1/generate-garment` → `{id, name, file_path, image_url}`

### Component 3 — PiAPI Client ✅
Async wrapper for Kling AI and Gemini task creation and polling via PiAPI.
- Input: model name, task type, input payload dict
- Output: completed task data dict (contains image_url or video_url)
- Approach: `httpx` async client; POST to create task, GET to poll; linear back-off (5s → 15s, max 60 attempts); raises `APIError` on failure, `TaskTimeoutError` on timeout
- File: `clients/piapi_client.py`

### Component 4 — Try-On Service ✅
Orchestrates the full virtual try-on pipeline end to end.
- Input: `model_id` + `garment_id` (looked up from local JSON registries), `garment_type` ("upper" | "lower" | "overall")
- Output: result image URL; result saved locally to `data/tryon/{uuid}.jpg`; record in `data/tryon/tryon.json`
- Approach:
  1. Lookup model and garment records by ID from `data/model/model.json` and `data/garment/garment.json`
  2. Validate local image dimensions (≥ 512px both sides)
  3. Re-encode both images as clean JPEG via Pillow (fixes non-standard headers from Gemini CDN)
  4. Upload to ImgBB (`POST https://api.imgbb.com/1/upload?key=...`) — globally accessible CDN
  5. Submit to Kling AI via PiAPI (`model="kling"`, `task_type="ai_try_on"`)
  6. Poll until completed; extract `resource_without_watermark` URL
  7. Download result image and save locally to `data/tryon/{tryon_id}.jpg`
  8. Append full record to `data/tryon/tryon.json`
  9. Back-fill `public_image_url` and `tryon_result_url` into model.json and garment.json
- File: `services/tryon_service.py`
- API: `POST /api/v1/try-on` → `{result_url}`; `GET /api/v1/try-ons/{id}/download` → image file

### Component 4b — Project Registry ✅
Manages CRUD for project records (create, list, get, update, delete).
- Input: `ProjectRecord` — `{id, rawName, displayName, createdAt, assets: {modelIds, garmentIds, tryonIds, videoIds}}`; `id` is generated client-side (UUID)
- Output: `ProjectRecord` JSON; registry persisted to `data/project/project.json`
- Approach: JSON file registry; full-replace PUT (client sends complete object); newest projects inserted at index 0; 409 on duplicate POST
- File: `api/routers/project.py`
- API: `POST/GET/PUT/DELETE /api/v1/projects`

---

### Component 5 — Pose Engine
Manages named pose variations for multi-pose generation.
- Input: pose key string
- Output: text prompt string for PiAPI video input
- Approach: static `POSE_LIBRARY` dict mapping pose keys to descriptive prompts; generates Telegram InlineKeyboardMarkup for pose selection UI
- File: `services/pose_engine.py`

### Component 6 — Video Generator
Generates animated fashion videos from a try-on result image.
- Input: try-on result image URL, pose prompt, duration (5 or 10s)
- Output: MP4 URL (stored in R2)
- Approach: sends result image + prompt to PiAPI Kling video generation; 9:16 aspect ratio for mobile/reels; polls until complete; uploads MP4 to R2
- File: `services/video_generator.py`

### Component 7 — Usage Tracker / Rate Limiter
Enforces per-user daily limits and per-request cooldown.
- Input: user_id, action type (tryon / video)
- Output: bool (allowed or not), remaining quota
- Approach: Redis INCR with EXPIREAT end-of-day for daily counters; Redis SET NX with 5s TTL for per-request cooldown
- File: `bot/middleware/rate_limit.py`

### Component 8 — Celery Workers
Executes long-running tasks (try-on, video) outside the request cycle.
- Input: user_id, image URLs, chat_id (passed as task args)
- Output: result delivered to user via bot.send_photo() / send_video()
- Approach: Redis as broker (DB 0) and result backend (DB 1); tasks are synchronous wrappers using `asyncio.run()` at the boundary; max 3 retries on transient failure
- File: `workers/celery_app.py`, `workers/tasks/`

### Component 9 — Telegram Bot *(future phase)*
Handles conversation flow, image collection, and result delivery.
- Input: Telegram Update (photo, command, callback query)
- Output: messages, inline keyboards, images, videos sent to user
- Approach: python-telegram-bot 21.x async; ConversationHandler for multi-step photo collection; session state in Redis JSON (TTL 1800s); rate limit check before every handler
- File: `bot/`

---

## REST API Endpoints (Phase 1)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/generate-model` | Generate model image from prompt → `{id, name, file_path, image_url}` |
| `POST` | `/api/v1/generate-garment` | Generate garment image from prompt → `{id, name, file_path, image_url}` |
| `POST` | `/api/v1/try-on` | Run try-on for `{model_id, garment_id, garment_type}` → `{result_url}` |
| `GET` | `/api/v1/try-ons/{id}/download` | Stream result image as file download |
| `GET` | `/api/v1/models` | List all generated models |
| `GET` | `/api/v1/models/{id}` | Get model by ID |
| `GET` | `/api/v1/garments` | List all generated garments |
| `GET` | `/api/v1/garments/{id}` | Get garment by ID |
| `GET` | `/api/v1/try-ons` | List all try-on results |
| `GET` | `/api/v1/try-ons/{id}` | Get try-on result by ID |
| `GET` | `/api/v1/videos` | List all generated videos |
| `GET` | `/api/v1/videos/{id}` | Get video by ID |
| `POST` | `/api/v1/projects` | Create a new project → `ProjectRecord` |
| `GET` | `/api/v1/projects` | List all projects |
| `GET` | `/api/v1/projects/{id}` | Get project by ID |
| `PUT` | `/api/v1/projects/{id}` | Full-replace update (rename, assets) → `ProjectRecord` |
| `DELETE` | `/api/v1/projects/{id}` | Delete a project (204) |

---

## Local Data Storage

| Path | Contents |
|---|---|
| `data/model/{uuid}.jpg` | Generated model images |
| `data/model/model.json` | Registry of all generated models (id, name, prompt, file_path, image_url, public_image_url, tryon_result_url) |
| `data/garment/{uuid}.jpg` | Generated garment images |
| `data/garment/garment.json` | Registry of all generated garments (same schema as model.json) |
| `data/tryon/{uuid}.jpg` | Downloaded try-on result images |
| `data/tryon/tryon.json` | Registry of all try-on results (id, model_id, garment_id, result_url, file_path, …) |
| `data/project/project.json` | Registry of all projects (id, rawName, displayName, createdAt, assets) |

---

## Phase Build Order

**Phase 1 — Backend:**
1. `core/` — config, exceptions, constants, logging ✅
2. `clients/piapi_client.py` ✅
3. `services/image_processor.py` ✅
4. `services/model_generator.py` ✅
5. `services/garment_generator.py` ✅
6. `api/main.py` + `api/routers/model.py` + `api/routers/garment.py` ✅
7. `services/tryon_service.py` + `api/routers/tryon.py` ✅
8. `api/routers/project.py` ✅
9. `workers/` — celery_app + tryon_tasks

**Phase 2 — Telegram Integration:**
9. `bot/` — handlers, keyboards, states
10. FastAPI webhook endpoint

**Phase 3 — Advanced:**
Pose engine, video generator, batch try-on, observability, scaling
