import { useParams, Link } from 'react-router'
import { useLocation } from '../hooks/useLocation.ts'
import { Exit } from '../apis/locations.ts'

const DIRECTION_LABELS: Record<string, string> = {
  north: 'N',
  south: 'S',
  east:  'E',
  west:  'W',
}

function ExitButton({ exit }: { exit: Exit }) {
  const label = DIRECTION_LABELS[exit.direction] ?? exit.direction.toUpperCase()

  // Locked — riddle not yet solved
  if (exit.isLocked) {
    return (
      <div className="exit exit--locked">
        <span className="exit__direction">{label}</span>
        <span className="exit__status">locked</span>
        {exit.riddleQuestion && (
          <p className="exit__riddle-question">{exit.riddleQuestion}</p>
        )}
      </div>
    )
  }

  // Open, destination not yet visited
  if (!exit.destinationVisited) {
    return (
      <div className="exit exit--unvisited">
        <span className="exit__direction">{label}</span>
        <span className="exit__status">unexplored</span>
      </div>
    )
  }

  // Open, destination visited — navigable
  return (
    <Link to={`/location/${exit.toSlug}`} className="exit exit--open">
      <span className="exit__direction">{label}</span>
    </Link>
  )
}

function LocationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: location, isLoading, isError, error } = useLocation(slug as string)

  if (isLoading) return <p>Loading...</p>

  if (isError) {
    const status = (error as { status?: number }).status
    if (status === 403) {
      return <p>You have not been to this location yet. Find the QR code to unlock it.</p>
    }
    return <p>Something went wrong.</p>
  }

  if (!location) return null

  return (
    <div className="location">
      <h1 className="location__name">{location.name}</h1>
      <p className="location__description">{location.description}</p>
      <div className="location__exits">
        {location.exits.map((exit) => (
          <ExitButton key={exit.id} exit={exit} />
        ))}
      </div>
    </div>
  )
}

export default LocationPage
