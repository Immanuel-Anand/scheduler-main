'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function NotFoundContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mt-4">
        {message || "Page not found"}
      </h2>
      <p className="text-gray-500 mt-2">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        Go back home
      </Link>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">
          Loading...
        </h2>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  )
} 