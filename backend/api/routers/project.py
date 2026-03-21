"""
Project management router.

POST   /api/v1/projects                 Create a new project.
GET    /api/v1/projects                 List all projects.
GET    /api/v1/projects/{project_id}    Get a single project by ID.
PUT    /api/v1/projects/{project_id}    Update a project (rename, assets, etc.).
DELETE /api/v1/projects/{project_id}    Delete a project.
"""

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

PROJECT_REGISTRY = Path("data/project/project.json")

router = APIRouter()


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ProjectAssets(BaseModel):
    modelIds: list[str] = Field(default_factory=list)
    garmentIds: list[str] = Field(default_factory=list)
    tryonIds: list[str] = Field(default_factory=list)
    videoIds: list[str] = Field(default_factory=list)


class ProjectRecord(BaseModel):
    id: str
    rawName: str
    displayName: str
    createdAt: str
    assets: ProjectAssets


class UpsertProjectRequest(BaseModel):
    id: str = Field(..., description="UUID of the project (generated client-side).")
    rawName: str = Field(..., description="Raw project name as entered by the user.")
    displayName: str = Field(..., description="Formatted display name (e.g. 'Name-DD/MM/YYYY').")
    createdAt: str = Field(..., description="ISO 8601 creation timestamp.")
    assets: ProjectAssets = Field(default_factory=ProjectAssets)


# ---------------------------------------------------------------------------
# Registry helpers
# ---------------------------------------------------------------------------

def _read_registry() -> list[dict]:
    if not PROJECT_REGISTRY.exists():
        return []
    return json.loads(PROJECT_REGISTRY.read_text(encoding="utf-8"))


def _write_registry(projects: list[dict]) -> None:
    PROJECT_REGISTRY.parent.mkdir(parents=True, exist_ok=True)
    PROJECT_REGISTRY.write_text(json.dumps(projects, indent=2, ensure_ascii=False), encoding="utf-8")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/projects",
    response_model=ProjectRecord,
    summary="Create a project",
    description="Persist a new project record (created client-side) to the server registry.",
)
async def create_project(body: UpsertProjectRequest) -> ProjectRecord:
    projects = _read_registry()
    if any(p["id"] == body.id for p in projects):
        raise HTTPException(status_code=409, detail=f"Project '{body.id}' already exists. Use PUT to update.")
    record = body.model_dump()
    projects.insert(0, record)
    _write_registry(projects)
    return ProjectRecord(**record)


@router.get(
    "/projects",
    response_model=list[ProjectRecord],
    summary="List all projects",
)
async def list_projects() -> list[ProjectRecord]:
    return [ProjectRecord(**p) for p in _read_registry()]


@router.get(
    "/projects/{project_id}",
    response_model=ProjectRecord,
    summary="Get a project by ID",
)
async def get_project(project_id: str) -> ProjectRecord:
    record = next((p for p in _read_registry() if p["id"] == project_id), None)
    if not record:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    return ProjectRecord(**record)


@router.put(
    "/projects/{project_id}",
    response_model=ProjectRecord,
    summary="Update a project",
    description="Full replace of a project record (rename, add/remove asset IDs, etc.).",
)
async def update_project(project_id: str, body: UpsertProjectRequest) -> ProjectRecord:
    projects = _read_registry()
    idx = next((i for i, p in enumerate(projects) if p["id"] == project_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    record = body.model_dump()
    record["id"] = project_id  # ensure path param wins
    projects[idx] = record
    _write_registry(projects)
    return ProjectRecord(**record)


@router.delete(
    "/projects/{project_id}",
    status_code=204,
    summary="Delete a project",
)
async def delete_project(project_id: str) -> None:
    projects = _read_registry()
    filtered = [p for p in projects if p["id"] != project_id]
    if len(filtered) == len(projects):
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    _write_registry(filtered)
