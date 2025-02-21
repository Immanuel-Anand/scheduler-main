import { db } from "@/lib/prisma";

export async function getUserByUsername(username) {
    const user = await db.user.findUnique({
        where: { username },
        // here list the details we need 
        select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            events: {
                where: {
                    isPrivate: false, // We need only public events
                },
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    duration: true,
                    isPrivate: true,
                    _count: {
                        select: {bookings: true} // We want to display the number of bookings for that particular event
                    }
                }
            }
        }
    })
    return user;
}