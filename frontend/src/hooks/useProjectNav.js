import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProject } from '../utils/projectStore'

export function useProjectNav() {
  const { projectId } = useParams()
  const id = projectId ?? null
  const [project, setProject] = useState(null)

  useEffect(() => {
    if (id) getProject(id).then(setProject)
    else setProject(null)
  }, [id])

  const to = (path) => (id ? `/projects/${id}${path}` : path)

  return { projectId: id, project, to }
}
