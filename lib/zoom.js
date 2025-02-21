export async function createZoomMeeting(user, event, startTime, duration) {
  try {
    // Check if access token needs refresh
    if (needsTokenRefresh(user.zoomTokenExpires)) {
      await refreshZoomToken(user);
    }

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.zoomAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: event.title,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: duration,
        timezone: "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          waiting_room: true,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create Zoom meeting');
    }

    const meeting = await response.json();
    return {
      meetingId: meeting.id,
      meetingUrl: meeting.join_url,
      password: meeting.password
    };
  } catch (error) {
    console.error('[CREATE_ZOOM_MEETING_ERROR]', error);
    throw error;
  }
}

function needsTokenRefresh(expiresAt) {
  if (!expiresAt) return true;
  // Refresh if token expires in less than 5 minutes
  return new Date(expiresAt).getTime() - Date.now() < 5 * 60 * 1000;
}

async function refreshZoomToken(user) {
  try {
    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.zoomRefreshToken
      })
    });

    const data = await response.json();
    
    // Update tokens in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        zoomAccessToken: data.access_token,
        zoomRefreshToken: data.refresh_token,
        zoomTokenExpires: new Date(Date.now() + data.expires_in * 1000)
      }
    });

    return data.access_token;
  } catch (error) {
    console.error('[REFRESH_ZOOM_TOKEN_ERROR]', error);
    throw error;
  }
} 