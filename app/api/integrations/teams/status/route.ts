import { NextResponse } from "next/server"
import {db} from "../../../../../lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: "User ID required" },
      { status: 400 }
    )
  }

  const integration = await db.microsoftIntegration.findUnique({
    where: { userId }
  })

  return NextResponse.json({
    connected: !!integration,
    expiresAt: integration?.expiresAt
  })
} 