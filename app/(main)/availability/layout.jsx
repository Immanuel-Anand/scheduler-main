import React, { Suspense } from 'react'

export default function AvailabilityLayout({children}) {
    return (
        <div className="mx-auto">

        {/* Events may not be available, so we need a fall back ui. So, we put them here. */}
        <Suspense fallback={<div>Loading Availability...</div>}>
{children}
        </Suspense>
        </div>
    )
}