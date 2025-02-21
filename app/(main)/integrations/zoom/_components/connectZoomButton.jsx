'use client'

import { Button } from "../../../../../components/ui/button"

export default function ConnectZoomButton() {
  return (
    <Button 
      size="lg"
      onClick={() => {
        window.location.href = '/api/auth/zoom'
      }}
    >
      Connect to Zoom
    </Button>
  )
} 