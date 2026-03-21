import {
  apiCreateProject,
  apiDeleteProject,
  apiGetProject,
  apiGetProjects,
  apiUpdateProject,
} from '../api/fashionApi'

// ---------------------------------------------------------------------------
// Active project — UI state only, stays in localStorage
// ---------------------------------------------------------------------------

const ACTIVE_KEY = 'fashionai_activeProjectId'

export function setActiveProject(id) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function getActiveProjectId() {
  return localStorage.getItem(ACTIVE_KEY) || null
}

export function clearActiveProject() {
  localStorage.removeItem(ACTIVE_KEY)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pad(n) { return String(n).padStart(2, '0') }

function formatDate(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

function computeDisplayName(rawName) {
  const date = formatDate(new Date())
  return rawName.trim() ? `${rawName.trim()}-${date}` : `Untitled-${date}`
}

// ---------------------------------------------------------------------------
// Data functions — all async, all backed by the API
// ---------------------------------------------------------------------------

export async function getProjects() {
  const { data } = await apiGetProjects()
  return data || []
}

export async function getProject(id) {
  const { data } = await apiGetProject(id)
  return data || null
}

export async function getActiveProject() {
  const id = getActiveProjectId()
  return id ? getProject(id) : null
}

export async function createProject(rawName = '') {
  const project = {
    id: crypto.randomUUID(),
    rawName: rawName.trim(),
    displayName: computeDisplayName(rawName),
    createdAt: new Date().toISOString(),
    assets: { modelIds: [], garmentIds: [], tryonIds: [], videoIds: [] },
  }
  const { data } = await apiCreateProject(project)
  if (data) setActiveProject(data.id)
  return data || null
}

export async function renameProject(id, rawName) {
  const project = await getProject(id)
  if (!project) return
  await apiUpdateProject(id, {
    ...project,
    rawName: rawName.trim(),
    displayName: computeDisplayName(rawName),
  })
}

export async function deleteProject(id) {
  await apiDeleteProject(id)
  if (getActiveProjectId() === id) clearActiveProject()
}

export async function addAssetToProject(projectId, assetType, assetId) {
  if (!assetId) return
  const project = await getProject(projectId)
  if (!project) return
  const ids = project.assets[assetType] || []
  if (ids.includes(assetId)) return
  await apiUpdateProject(projectId, {
    ...project,
    assets: { ...project.assets, [assetType]: [...ids, assetId] },
  })
}

export async function addAssetToActiveProject(assetType, assetId) {
  const id = getActiveProjectId()
  if (id) await addAssetToProject(id, assetType, assetId)
}
