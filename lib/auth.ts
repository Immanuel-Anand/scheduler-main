import NextAuth from "next-auth"
import Microsoft from "next-auth/providers/azure-ad"

export const authOptions = {
  providers: [
    Microsoft({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    }),
  ],
}

export default NextAuth(authOptions) 