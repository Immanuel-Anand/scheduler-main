export async function checkAndRefreshTokens() {
  const expiringSoon = new Date(Date.now() + 3600 * 1000) // 1 hour window
  const integrations = await prisma.microsoftIntegration.findMany({
    where: {
      expiresAt: {
        lte: expiringSoon
      }
    }
  })

  for (const integration of integrations) {
    try {
      const newTokens = await Microsoft.refreshToken(decrypt(integration.refreshToken))
      
      await prisma.microsoftIntegration.update({
        where: { userId: integration.userId },
        data: {
          accessToken: encrypt(newTokens.access_token),
          refreshToken: encrypt(newTokens.refresh_token),
          expiresAt: new Date(Date.now() + newTokens.expires_in * 1000)
        }
      })
    } catch (error) {
      console.error(`Token refresh failed for user ${integration.userId}:`, error)
      // Handle failed refresh (notify user, disconnect, etc.)
    }
  }
} 