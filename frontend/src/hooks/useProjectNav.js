import { useParams } from 'react-router-dom'
import { getProject } from '../utils/projectStore'

export function useProjectNav() {
  const { projectId } = useParams()
  const id = projectId ?? null
  const project = id ? getProject(id) : null

  const to = (path) => (id ? `/projects/${id}${path}` : path)

  return { projectId: id, project, to }
}
