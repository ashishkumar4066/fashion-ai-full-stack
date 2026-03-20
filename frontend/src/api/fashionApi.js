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
    if (status === 400) return data?.detail || 'Bad request. Please check image URLs.'
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

export async function uploadImage(file) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}

export async function runTryOn(personImageUrl, garmentImageUrl, garmentType = 'upper', userId = 1) {
  try {
    const res = await api.post(
      '/try-on',
      {
        user_id: userId,
        person_image_url: personImageUrl,
        garment_image_url: garmentImageUrl,
        garment_type: garmentType,
      },
      { timeout: 310000 },
    )
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: parseError(err) }
  }
}
