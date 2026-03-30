import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { scanToken } from '../apis/scan.ts'

function ScanPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const scan = useMutation({
    mutationFn: () => scanToken(token as string),
    onSuccess: ({ slug }) => navigate(`/location/${slug}`),
  })

  useEffect(() => {
    scan.mutate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (scan.isPending) {
    return <p>Scanning location...</p>
  }

  if (scan.isError) {
    const status = (scan.error as { status?: number }).status
    if (status === 401) {
      return (
        <div>
          <p>You need to be logged in to scan a location.</p>
          <a href={`/login?next=/scan/${token}`}>Log in</a>
        </div>
      )
    }
    return <p>Something went wrong. Are you in the right place?</p>
  }

  return null
}

export default ScanPage
