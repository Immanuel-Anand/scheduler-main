import { NextResponse } from "next/server"

const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoom/callback`

export async function GET(req) {
  // Generate a random state value for security
  const state = Math.random().toString(36).substring(7)
  
  // Store state in session/cookie for verification in callback
  
  // Construct Zoom OAuth URL
  const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}`
  
  // Redirect to Zoom login
  return NextResponse.redirect(zoomAuthUrl)
} 