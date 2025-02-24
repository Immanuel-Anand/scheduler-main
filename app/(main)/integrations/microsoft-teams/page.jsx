'use client'

import { useEffect, useState } from 'react'
import { Card } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'

export default function MicrosoftTeamsIntegration() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const handleConnect = () => {
    setLoading(true)
    const clientId = process.env.NEXT_PUBLIC_MS_TEAMS_CLIENT_ID
    // Verify clientId is properly set in environment variables
    const redirectUri = "http://localhost:3000/api/auth/callback/microsoft"

    // Add required scopes for meeting creation
    const scopes = encodeURIComponent('offline_access User.Read OnlineMeetings.ReadWrite')
    // Include tenant ID if using single-tenant app
    window.location.href = `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_MS_TENANT_ID || 'common'}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scopes}`
  }

  useEffect(() => {
    if (code) {
      setLoading(true)
      fetch('/api/integrations/microsoft-teams', {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) throw new Error('API request failed')
        return response.json()
      })
      .then(data => {
        if (data.success) {
          setIsConnected(true)
        } else {
          // Handle API error response
          console.error('Connection failed:', data.error)
        }
      })
      .catch(error => {
        console.error('Error:', error)
        // Add user-facing error message here
      })
      .finally(() => setLoading(false))
    }
  }, [code])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative w-24 h-24">
            <Image
              src="/location-icons/ms-teams.svg"
              alt="Microsoft Teams"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-4">Microsoft Teams Integration</h1>
            
            {isConnected ? (
              <div className="text-green-600 mb-4">
                ✅ Successfully connected to Microsoft Teams
              </div>
            ) : (
              <Button 
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Microsoft Teams Account'}
              </Button>
            )}

            <p className="mt-4 text-muted-foreground">
              {isConnected 
                ? "Your Microsoft Teams account is connected. You can now create Teams meetings directly in your bookings."
                : "Click the button above to connect your Microsoft Teams account. This will allow you to create Teams meetings directly in your bookings."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}