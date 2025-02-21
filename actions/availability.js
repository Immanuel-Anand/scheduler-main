"use server"
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache" 
import { formatInTimeZone } from 'date-fns-tz/formatInTimeZone'

export async function getUserAvailability(timezone) {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: {
            availability: {
                include: {
                    days: true,
                    dateOverrides: true,
                    holidays: true,
                }
            }
        }
    })

    if (!user || !user.availability) {
        return null
    }

    const formatTime = (utcTime) => {
        return formatInTimeZone(utcTime, timezone, 'HH:mm')
    }

    const availabilityData = {
        timeGap: user.availability.timeGap,
        dateOverrides: {},
        holidays: {}
    };

    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        .forEach((day) => {
            const dayAvailability = user.availability.days.find((d) => d.day === day.toUpperCase())
            availabilityData[day] = {
                isAvailable: !!dayAvailability,
                startTime: dayAvailability ? formatTime(dayAvailability.startTime) : "09:00",
                endTime: dayAvailability ? formatTime(dayAvailability.endTime) : "09:00",
            }
        })

    user.availability.dateOverrides.forEach((override) => {
        const dateStr = override.date.toISOString().split('T')[0]
        availabilityData.dateOverrides[dateStr] = {
            isAvailable: true,
            startTime: formatTime(override.startTime),
            endTime: formatTime(override.endTime),
        }
    })

    user.availability.holidays.forEach((holiday) => {
        const dateStr = holiday.date.toISOString().split('T')[0]
        availabilityData.holidays[dateStr] = {
            name: holiday.name
        }
    })

    return availabilityData
}

export async function updateAvailability(formData) {
    try {
        const { userId } = await auth()
        if (!userId) {
            throw new Error("Unauthorized")
        }

        const { timezone, ...data } = formData

        // Convert time to UTC
                const convertToUTC = (time, date = '2024-01-01') => {
            try {
                const fullDate = `${date}T${time}`
                return new Date(`${date}T${time}:00.000Z`)
            } catch (error) {
                console.error("Time conversion error:", error, {
                    time,
                    date,
                    timezone,
                    fullDate: `${date}T${time}:00.000Z`
                })
                throw new Error(`Failed to convert time: ${time} to UTC`)
            }
        }
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            include: {
                availability: {
                    include: {
                        holidays: true
                    }
                }
            }
        })

        if (!user) {
            throw new Error("User not found")
        }

        // Process holidays data
        const holidaysData = Object.entries(data.holidays || {}).map(([date, holiday]) => ({
            date: new Date(date),
            name: holiday.name
        }))

        // Process regular days with timezone conversion
        const regularDaysData = Object.entries(data)
            .filter(([key]) => !['timeGap', 'dateOverrides', 'holidays'].includes(key))
            .flatMap(([day, { isAvailable, startTime, endTime }]) => {
                if (isAvailable) {
                    return [{
                        day: day.toUpperCase(),
                        startTime: convertToUTC(startTime),
                        endTime: convertToUTC(endTime)
                    }]
                }
                return []
            })

        if (user.availability) {
            try {
                // First delete existing holidays
                await db.holiday.deleteMany({
                    where: {
                        availabilityId: user.availability.id
                    }
                });

                // Then create new holidays
                if (holidaysData.length > 0) {
                    for (const holiday of holidaysData) {
                        await db.holiday.create({
                            data: {
                                ...holiday,
                                availability: {
                                    connect: {
                                        id: user.availability.id
                                    }
                                }
                            }
                        });
                    }
                }

                // Update the rest of availability data
                await db.availability.update({
                    where: { id: user.availability.id },
                    data: {
                        timeGap: data.timeGap,
                        days: {
                            deleteMany: {},
                            create: regularDaysData,
                        },
                        dateOverrides: {
                            deleteMany: {},
                            create: Object.entries(data.dateOverrides || {}).map(([date, override]) => ({
                                date: new Date(date),
                                startTime: convertToUTC(override.startTime, date),
                                endTime: convertToUTC(override.endTime, date)
                            }))
                        }
                    }
                });
            } catch (error) {
                console.error("Database operation error:", error)
                throw new Error(`Failed to update availability: ${error.message}`)
            }
        } else {
            // Create new availability
            await db.availability.create({
                data: {
                    userId: user.id,
                    timeGap: data.timeGap,
                    days: {
                        create: regularDaysData,
                    },
                    dateOverrides: {
                        create: Object.entries(data.dateOverrides || {}).map(([date, override]) => ({
                            date: new Date(date),
                            startTime: convertToUTC(override.startTime, date),
                            endTime: convertToUTC(override.endTime, date)
                        }))
                    },
                    holidays: {
                        create: holidaysData
                    }
                }
            })
        }

        revalidatePath('/availability')
        return { success: true }
    } catch (error) {
        console.error("Update availability error:", error)
        throw error
    }
}