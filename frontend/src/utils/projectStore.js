const KEY = 'fashionai_projects'
const ACTIVE_KEY = 'fashionai_activeProjectId'

function pad(n) { return String(n).padStart(2, '0') }

function formatDate(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

function computeDisplayName(rawName) {
  const date = formatDate(new Date())
  return rawName.trim() ? `${rawName.trim()}-${date}` : `Untitled-${date}`
}

export function getProjects() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function saveProjects(projects) {
  localStorage.setItem(KEY, JSON.stringify(projects))
}

export function getProject(id) {
  return getProjects().find((p) => p.id === id) || null
}

export function createProject(rawName = '') {
  const project = {
    id: crypto.randomUUID(),
    rawName: rawName.trim(),
    displayName: computeDisplayName(rawName),
    createdAt: new Date().toISOString(),
    assets: { modelIds: [], garmentIds: [], tryonIds: [], videoIds: [] },
  }
  const projects = getProjects()
  projects.unshift(project)
  saveProjects(projects)
  setActiveProject(project.id)
  return project
}

export function renameProject(id, rawName) {
  const projects = getProjects().map((p) =>
    p.id === id ? { ...p, rawName: rawName.trim(), displayName: computeDisplayName(rawName) } : p
  )
  saveProjects(projects)
}

export function deleteProject(id) {
  saveProjects(getProjects().filter((p) => p.id !== id))
  if (getActiveProjectId() === id) clearActiveProject()
}

export function setActiveProject(id) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function getActiveProjectId() {
  return localStorage.getItem(ACTIVE_KEY) || null
}

export function getActiveProject() {
  const id = getActiveProjectId()
  return id ? getProject(id) : null
}

export function clearActiveProject() {
  localStorage.removeItem(ACTIVE_KEY)
}

export function addAssetToProject(projectId, assetType, assetId) {
  if (!assetId) return
  const projects = getProjects().map((p) => {
    if (p.id !== projectId) return p
    const ids = p.assets[assetType] || []
    if (ids.includes(assetId)) return p
    return { ...p, assets: { ...p.assets, [assetType]: [...ids, assetId] } }
  })
  saveProjects(projects)
}

export function addAssetToActiveProject(assetType, assetId) {
  const id = getActiveProjectId()
  if (id) addAssetToProject(id, assetType, assetId)
}
