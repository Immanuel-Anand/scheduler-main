"use server"

import { db } from "../lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function createSchedule(name) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        schedules: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Create new schedule with default availability
    const schedule = await db.schedule.create({
      data: {
        name,
        userId: user.id,
        isDefault: user.schedules.length === 0,
        availability: {
          create: {
            userId: user.id,
            timeGap: 0,
            days: {
              create: [
                { day: 'MONDAY', startTime: new Date('2024-01-01T09:00:00Z'), endTime: new Date('2024-01-01T17:00:00Z') },
                { day: 'TUESDAY', startTime: new Date('2024-01-01T09:00:00Z'), endTime: new Date('2024-01-01T17:00:00Z') },
                { day: 'WEDNESDAY', startTime: new Date('2024-01-01T09:00:00Z'), endTime: new Date('2024-01-01T17:00:00Z') },
                { day: 'THURSDAY', startTime: new Date('2024-01-01T09:00:00Z'), endTime: new Date('2024-01-01T17:00:00Z') },
                { day: 'FRIDAY', startTime: new Date('2024-01-01T09:00:00Z'), endTime: new Date('2024-01-01T17:00:00Z') },
              ]
            }
          }
        }
      },
      include: {
        availability: {
          include: {
            days: true,
            dateOverrides: true,
            holidays: true
          }
        }
      }
    })

    revalidatePath('/availability')
    return { success: true, data: schedule }
  } catch (error) {
    console.error("[CREATE_SCHEDULE_ERROR]", error)
    return { success: false, error: error.message }
  }
}

export async function getSchedules() {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        schedules: {
          include: {
            availability: true
          }
        },
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    return { success: true, data: user.schedules }
  } catch (error) {
    console.error("[GET_SCHEDULES_ERROR]", error)
    return { success: false, error: error.message }
  }
}

export async function getScheduleAvailability(scheduleId) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const schedule = await db.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        availability: {
          include: {
            days: true,
            dateOverrides: true,
            holidays: true
          }
        }
      }
    })

    if (!schedule) {
      throw new Error("Schedule not found")
    }

    // Transform the availability data for the form
    const availabilityData = schedule.availability ? {
      scheduleId: schedule.id,
      timeGap: schedule.availability.timeGap,
      dateOverrides: schedule.availability.dateOverrides.reduce((acc, override) => ({
        ...acc,
        [override.date.toISOString().split('T')[0]]: {
          isAvailable: true,
          startTime: override.startTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          endTime: override.endTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        }
      }), {}),
      holidays: schedule.availability.holidays.reduce((acc, holiday) => ({
        ...acc,
        [holiday.date.toISOString().split('T')[0]]: {
          name: holiday.name
        }
      }), {}),
      ...schedule.availability.days.reduce((acc, day) => ({
        ...acc,
        [day.day.toLowerCase()]: {
          isAvailable: true,
          startTime: day.startTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          endTime: day.endTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        }
      }), {})
    } : null

    return { success: true, data: availabilityData }
  } catch (error) {
    console.error("[GET_SCHEDULE_AVAILABILITY_ERROR]", error)
    return { success: false, error: error.message }
  }
}

export async function assignScheduleToEvents({ scheduleId, eventIds }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Update events with the new schedule
    await db.event.updateMany({
      where: {
        id: {
          in: eventIds
        },
        userId: user.id
      },
      data: {
        scheduleId
      }
    })

    revalidatePath('/availability')
    return { success: true }
  } catch (error) {
    console.error("[ASSIGN_SCHEDULE_ERROR]", error)
    return { success: false, error: error.message }
  }
}
