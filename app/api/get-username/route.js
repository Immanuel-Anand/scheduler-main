
import { db } from "../../../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
      const { userId } = await auth();
      
      console.log('userId is', userId)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        username: true,
      },
    });

    return NextResponse.json({ username: user?.username });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

      const { username } = await request.json();
      
      const existingUsername = await db.user.findUnique({
          where: {username}
      })
      if (existingUsername && existingUsername.id !== userId) {
          throw new Error("Username is already taken")
      }

    const updatedUser = await db.user.update({
      where: {
        clerkUserId: userId,
      },
      data: {
        username,
      },
      select: {
        username: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}