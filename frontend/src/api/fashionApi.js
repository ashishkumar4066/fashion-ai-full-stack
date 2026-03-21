import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

function parseError(err) {
  if (err.response) {
    const status = err.response.status
    const data = err.response.data
    if (status === 422) {
      const detail = data?.detail
      if (Array.isArray(detail)) {
        return detail.map((d) => d.msg).join('; ')
      }
      return detail || 'Validation error. Please check your inputs.'
    }
    if (status === 504) return 'Request timed out. The AI is taking too long — please try again.'
    if (status === 502) return 'External AI service error. Please try again in a moment.'
    if (status === 400) return data?.detail || 'Bad request.'
    return data?.detail || `Server error (${status}).`
  }
  if (err.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
  return 'Network error. Make sure the backend is running.'
}

export async function generateModel(prompt, aspectRatio = '2:3') {
  try {
    const res = await api.post(
      '/generate-model',
      { prompt, aspect_ratio: aspectRatio },
      { timeout: 310000 },
    )
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function generateGarment(prompt, aspectRatio = '1:1') {
  try {
    const res = await api.post(
      '/generate-garment',
      { prompt, aspect_ratio: aspectRatio },
      { timeout: 310000 },
    )
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function runTryOn(modelId, garmentId, garmentType = 'upper') {
  try {
    const res = await api.post(
      '/try-on',
      {
        model_id: modelId,
        garment_id: garmentId,
        garment_type: garmentType,
      },
      { timeout: 310000 },
    )
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function getModels() {
  try {
    const res = await api.get('/models')
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function getModel(modelId) {
  try {
    const res = await api.get(`/models/${modelId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function getGarments() {
  try {
    const res = await api.get('/garments')
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function getGarment(garmentId) {
  try {
    const res = await api.get(`/garments/${garmentId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function getTryOns() {
  try {
    const res = await api.get('/try-ons')
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function getTryOn(tryonId) {
  try {
    const res = await api.get(`/try-ons/${tryonId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function generateVideo(tryonId, prompt, duration = 5, aspectRatio = '9:16') {
  try {
    const res = await api.post(
      '/generate-video',
      { tryon_id: tryonId, prompt: prompt || undefined, duration, aspect_ratio: aspectRatio },
      { timeout: 310000 },
    )
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function getVideos() {
  try {
    const res = await api.get('/videos')
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function getVideo(videoId) {
  try {
    const res = await api.get(`/videos/${videoId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function apiCreateProject(project) {
  try {
    const res = await api.post('/projects', project)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function apiGetProjects() {
  try {
    const res = await api.get('/projects')
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function apiGetProject(id) {
  try {
    const res = await api.get(`/projects/${id}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function apiUpdateProject(id, project) {
  try {
    const res = await api.put(`/projects/${id}`, project)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function apiDeleteProject(id) {
  try {
    await api.delete(`/projects/${id}`)
    return { data: true, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}
