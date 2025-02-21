'use client'

import React from 'react'
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Input } from "../../../components/ui/input"
import { Search } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const integrations = [
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '/location-icons/zoom.svg',
    description: 'Include Zoom details in your events.',
    status: 'Connected',
    href: '/integrations/zoom'
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    icon: '/location-icons/google-meet.svg',
    description: 'Include Google Meet details in your events.',
    status: 'Admin',
    href: '/integrations/google-meet'
  },
    // Add more integrations as needed
    {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      icon: '/location-icons/ms-teams.svg',
      description: 'Include Microsoft Teams details in your events.',
      status: 'Admin',
      href: '/integrations/microsoft-teams'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: '/location-icons/google-calendar.svg',
      description: 'Include Google Calendar details in your events.',
      status: 'Admin',
      href: '/integrations/google-calendar'
    },
    {
      id: 'outlook-calendar',
      name: 'Outlook Calendar',
      icon: '/location-icons/outlook-calendar.svg',
      description: 'Include Outlook Calendar details in your events.',
      status: 'Admin',
      href: '/integrations/outlook-calendar'
    },
    {
      id: 'hubspot',
      name: 'Hubspot',
      icon: '/location-icons/hubspot.svg',
      description: 'Include Hubspot details in your events.',
      status: 'Admin',
      href: '/integrations/hubspot'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      icon: '/location-icons/salesforce.svg',   
      description: 'Include Salesforce details in your events.',
      status: 'Admin',
      href: '/integrations/salesforce'
    },
        {
      id: 'stripe',
      name: 'Stripe',
      icon: '/location-icons/stripe.svg',
      description: 'Collect payments with Stripe before the meeting.',
      status: 'Admin',
      href: '/integrations/stripe'
    },
    {
      id: 'paypal',
      name: 'Paypal',
      icon: '/location-icons/paypal.svg',
      description: 'Collect payments with Paypal before the meeting.',
      status: 'Admin',
      href: '/integrations/paypal'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '/location-icons/slack.svg',
      description: 'Connect your bookings to Slack.',
      status: 'Admin',
      href: '/integrations/slack'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      icon: '/location-icons/zapier.svg',
      description: 'Connect your bookings to Zapier.',
      status: 'Admin',
      href: '/integrations/zapier'
    },
    {
      id: 'wordpress    ',
      name: 'Wordpress',
      icon: '/location-icons/wordpress.svg',
      description: 'Embed your booking page on your Wordpress website.',
      status: 'Admin',
      href: '/integrations/wordpress'
    },
    {
      id: 'wix  ',
      name: 'Wix',
      icon: '/location-icons/wix.svg',
      description: 'Embed your booking page on your Wix website.',
      status: 'Admin',
      href: '/integrations/wix'
    },
    {
      id: 'squarespace',
      name: 'Squarespace',
      icon: '/location-icons/squarespace.svg',
      description: 'Embed your booking page on your Squarespace website.',
      status: 'Admin',
      href: '/integrations/squarespace'
    }
]

function IntegrationsContent() {
  const searchParams = useSearchParams()
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Find integrations, apps, and more"
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Link key={integration.id} href={integration.href}>
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={integration.icon}
                      alt={integration.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <span className="text-sm text-blue-600">{integration.status}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Integrations</h1>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  )
}