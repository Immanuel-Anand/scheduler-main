import { NextResponse } from "next/server"
import { db } from "../../../../../lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    // Verify state matches stored state
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoom/callback`
      })
    })

    const { access_token, refresh_token } = await tokenResponse.json()

    // Get user info from Zoom
    const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })

    const zoomUser = await userResponse.json()

    // Store tokens in database
    const { userId } = await auth()
    await db.user.update({
      where: { clerkUserId: userId },
      data: {
        zoomAccessToken: access_token,
        zoomRefreshToken: refresh_token,
        zoomUserId: zoomUser.id
      }
    })

    // Redirect back to integrations page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=true`)
  } catch (error) {
    console.error('[ZOOM_CALLBACK_ERROR]', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=true`)
  }
} 