// 'use client'

// import { useEffect, useState } from 'react'
// import { Card } from "../../../../components/ui/card"
// import { Button } from "../../../../components/ui/button"
// import Image from "next/image"
// import { useSearchParams } from 'next/navigation'

// export default function MicrosoftTeamsIntegration() {
//   const [isConnected, setIsConnected] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const searchParams = useSearchParams()
//   const code = searchParams.get('code')

//   const handleConnect = () => {
//     setLoading(true)
//     // Replace with your Microsoft OAuth2 client ID and redirect URI
//     const clientId = process.env.NEXT_PUBLIC_MS_TEAMS_CLIENT_ID
//     const redirectUri = encodeURIComponent(`${window.location.origin}/integrations/microsoft-teams`)
//     const scopes = encodeURIComponent('offline_access https://graph.microsoft.com/.default')
//     window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scopes}`
//   }

//   useEffect(() => {
//     if (code) {
//       setLoading(true)
//       // Exchange authorization code for access token
//       fetch('/api/integrations/microsoft-teams', {
//         method: 'POST',
//         body: JSON.stringify({ code }),
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       })
//       .then(response => response.json())
//       .then(data => {
//         if (data.success) {
//           setIsConnected(true)
//         }
//       })
//       .finally(() => setLoading(false))
//     }
//   }, [code])

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <Card className="p-6">
//         <div className="flex items-start gap-6">
//           <div className="relative w-24 h-24">
//             <Image
//               src="/location-icons/ms-teams.svg"
//               alt="Microsoft Teams"
//               fill
//               className="object-contain"
//             />
//           </div>
//           <div className="flex-1">
//             <h1 className="text-2xl font-bold mb-4">Microsoft Teams Integration</h1>
            
//             {isConnected ? (
//               <div className="text-green-600 mb-4">
//                 ✅ Successfully connected to Microsoft Teams
//               </div>
//             ) : (
//               <Button 
//                 onClick={handleConnect}
//                 disabled={loading}
//               >
//                 {loading ? 'Connecting...' : 'Connect Microsoft Teams Account'}
//               </Button>
//             )}

//             <p className="mt-4 text-muted-foreground">
//               {isConnected 
//                 ? "Your Microsoft Teams account is connected. You can now create Teams meetings directly in your bookings."
//                 : "Click the button above to connect your Microsoft Teams account. This will allow you to create Teams meetings directly in your bookings."}
//             </p>
//           </div>
//         </div>
//       </Card>
//     </div>
//   )
// }
