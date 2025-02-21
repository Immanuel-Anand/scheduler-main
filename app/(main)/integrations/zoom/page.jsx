import React from 'react'
import { Button } from "../../../../components/ui/button"
import Image from "next/image"
import { Card } from "../../../../components/ui/card"
import ConnectZoomButton from './_components/connectZoomButton'

export default function ZoomIntegrationPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-16 h-16">
          <Image
            src="/location-icons/zoom.svg"
            alt="Zoom"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Zoom</h1>
          <p className="text-muted-foreground">Video conferencing</p>
        </div>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">About this integration</h2>
        <p className="text-muted-foreground mb-6">
          Schedule Zoom meetings automatically when events are booked. Your Zoom meeting details will be included in the event confirmation page and email.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Automatically creates Zoom meetings for scheduled events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Includes meeting link and password in confirmations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Works with your Zoom Pro, Business, or Enterprise account</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Connect your account</h2>
        <p className="text-muted-foreground mb-6">
          To get started, connect your Zoom account. You'll be redirected to Zoom to authorize access.
        </p>
        <ConnectZoomButton />
      </Card>
    </div>
  )
}
