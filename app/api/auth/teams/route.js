import { NextResponse } from 'next/server'

export async function POST(req) {
  const { code } = await req.json()
  
  try {
    // Exchange code for access token
    const params = new URLSearchParams()
    params.append('client_id', process.env.MS_TEAMS_CLIENT_ID)
    params.append('client_secret', process.env.MS_TEAMS_CLIENT_SECRET)
    params.append('code', code)
    params.append('redirect_uri', `${process.env.NEXTAUTH_URL}/integrations/microsoft-teams`)
    params.append('grant_type', 'authorization_code')

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error_description)
    }

    // Store the access token and refresh token securely in your database
    // You would typically associate this with the current user
    // await saveMicrosoftTokens(currentUser.id, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Microsoft Teams connection error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
