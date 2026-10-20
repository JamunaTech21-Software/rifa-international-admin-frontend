import { useParams } from 'react-router'
import PlaceholderPage from '@/pages/PlaceholderPage'

// Detail screens are reached from email links (/applications/:id, /messages/:id); built in AD-04 and AD-05.
export function ApplicationDetailPlaceholder() {
  const { id } = useParams()
  return <PlaceholderPage title={`Application #${id}`} story="AD-04" />
}

export function MessageDetailPlaceholder() {
  const { id } = useParams()
  return <PlaceholderPage title={`Message #${id}`} story="AD-05" />
}
