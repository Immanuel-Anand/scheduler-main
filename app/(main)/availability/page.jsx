import { db } from "../../../lib/prisma"
import { auth } from "@clerk/nextjs/server"
import AvailabilityForm from "./_components/availabilityForm"

export default async function AvailabilityPage() {
  const { userId } = await auth()
  
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      schedules: {
        include: {
          availability: {
            include: {
              days: true,
              dateOverrides: true,
              holidays: true
            }
          }
        }
      },
      events: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  // Transform the availability data for the form
  const defaultSchedule = user?.schedules.find(s => s.isDefault)
  const initialData = defaultSchedule?.availability ? {
    scheduleId: defaultSchedule.id,
    timeGap: defaultSchedule.availability.timeGap,
    dateOverrides: defaultSchedule.availability.dateOverrides.reduce((acc, override) => ({
      ...acc,
      [override.date.toISOString().split('T')[0]]: {
        isAvailable: true,
        startTime: override.startTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        endTime: override.endTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      }
    }), {}),
    holidays: defaultSchedule.availability.holidays.reduce((acc, holiday) => ({
      ...acc,
      [holiday.date.toISOString().split('T')[0]]: {
        name: holiday.name
      }
    }), {}),
    ...defaultSchedule.availability.days.reduce((acc, day) => ({
      ...acc,
      [day.day.toLowerCase()]: {
        isAvailable: true,
        startTime: day.startTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        endTime: day.endTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      }
    }), {})
  } : null

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Availability Settings</h1>
      <AvailabilityForm 
        initialData={initialData}
        schedules={user?.schedules || []}
        events={user?.events || []}
      />
    </div>
  )
}