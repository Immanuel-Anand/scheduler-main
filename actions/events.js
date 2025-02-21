"use server"
import { db } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators";
import { auth } from "@clerk/nextjs/server";
import {
  startOfDay,
  addDays,
  format,
  parseISO,
  isBefore,
  addMinutes,
} from "date-fns";
import { revalidatePath } from "next/cache";

export async function createEvent(data) {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }
    // This is to validate our data against the eventSchema
    const validatedData = eventSchema.parse(data)
    const user = await db.user.findUnique({
        where: {clerkUserId: userId}
    })
    if (!user) {
    throw new Error("User is not found")
  }
    const defaultQuestions = {
    fields: [
      {
        fieldName: "additionalInfo",
        fieldTitle: "Additional Information",
        fieldType: "text",
        placeholder: "Enter your additional information",
        label: "Additional Information",
        required: false,
        options: []
      },
    ]
  };

    const event = await db.event.create({
        data: {
            ...validatedData,
        userId: user.id, // This is not the clerkid, this is the unique id stored inside our neon db
            questions: defaultQuestions, // Use default if not provided
        }
    })
    return event
}

export async function getUserEvents() {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }
    const user = await db.user.findUnique({
        where: {clerkUserId: userId}
    })
    if (!user) {
        throw new Error("User not found")
    }
    const events = await db.event.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: { // This will give the count of the bookings
                select: {bookings: true}, 
            }
        }
        
    })
    return {events, username: user.username} // We have the copy feature, when we copy it shoudl give us the username for the url
}

export async function deleteEvent(eventId) {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }
    const user = await db.user.findUnique({
        where: {clerkUserId: userId}
    })
    if (!user) {
        throw new Error("User not found")
    }
    const event = await db.event.findUnique({
        where: { id: eventId },
    })
    // If the event not exist or the event doesn't belong to the loggedIn userId
    if (!event || event.userId !== user.id) {
        throw new Error("Event not found or unauthorized")
    }
    await db.event.delete({
        where: {id: eventId}
    })
    return {success: true} // We have the copy feature, when we copy it shoudl give us the username for the url
}

export async function getEventDetails(username, eventId) {
  try {
    // We won't do any user verification, as it is public data
    const event = await db.event.findFirst({
      where: {
        id: eventId,
        user: {
          username: username,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            username: true,
            imageUrl: true,
          },
        },
      },
    });

    return event;
  } catch (error) {
    console.error("Error fetching event details:", error);
    throw new Error("Failed to fetch event details");
  }
}

export async function getEventData(eventId) {
  if (!eventId) {
    throw new Error("Event ID is required");
  }

  try {
    const event = await db.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  } catch (error) {
    console.error("Error fetching event data:", error);
    return null; // Return null instead of throwing error
  }
}

export async function updateEventData(eventId, jsonForm) {
  const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }
    const user = await db.user.findUnique({
        where: {clerkUserId: userId}
    })
    if (!user) {
        throw new Error("User not found")
    }
  try {
    const updatedEvent = await db.event.update({
      where: {
        id: eventId,
      },
      data: {
        questions: jsonForm,
      },
      select: {
        id: true,
      }
    });
    
    return { success: true, data: updatedEvent };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: error.message };
  }
}

export async function updateControllerFields(recordId, columnName, value) {
  // Add validation for required parameters
  if (!recordId || !columnName || value === undefined) {
    console.error("Missing required parameters:", { recordId, columnName, value });
    throw new Error("Missing required parameters");
  }

  try {
    // Ensure value is an object or can be stored properly
    const updateData = {
      [columnName]: value ?? null // Provide a fallback if value is undefined
    };

    const result = await db.event.update({
      where: {
        id: recordId,
      },
      data: updateData,
    });

    if (!result) {
      throw new Error("Update failed");
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating controller fields:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update field" 
    };
  }
}

// We need to get the event details and the user (who has created this event) availability too. So, we can list the user availability 
export async function getEventAvailability(eventId) {
    const event = await db.event.findUnique({
        where: {
            id: eventId,
        },
        include: {
            // We are inside the user table. We are fetching the availability of the user(owner of the event)
            user: {
                include: {
                    // Inside the availability table, we are selecting the days and timeGap
                    availability: {
                        select: {
                            days: true,
                            timeGap: true,
                            dateOverrides: true,
                            holidays: true,
                        },
                    },
                    // Besides availability, we also want bookings for the particular event for that particular user. If you were to get the bookings of just the user, we will get all the bookings. But, we want bookings with respect to this event only, we need to fetch the user bookings
                    bookings: {
                        // This will be used for removing the timeslots that are already booked
                        select: {
                            startTime: true,
                            endTime: true,
                        }
                    }
                }
            }
        }
    })
    // If there is no event or no user availabiliyt return null
    if (!event || !event.user.availability) {
        return [];
  }
  


     // when it comes to displaying the user slots, we will just be displaying the user slots for the next 60 days

    // To handle the logic related to dates, we will install library called Date FNS
    
        // When we are creating or updating the availability in our db, it is converting it to its own time zone. Now we want to convert  it back to our own time zone

    // Take out the availability and bookings for that particular user
    
    const { availability, bookings } = event.user;
    const startDate = startOfDay(new Date()) // Return the start of a day for the given date. The result will be in the local timezone.
    const endDate = addDays(startDate, 60) // 60 days from the start date

    const availableDates = []
    for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
        const dateStr = format(date, "yyyy-MM-dd")
        
        // Check for holidays first
        const isHoliday = availability.holidays.some(
            holiday => format(holiday.date, "yyyy-MM-dd") === dateStr
        )

        if (isHoliday) {
            // Skip this date if it's a holiday
            continue;
        }

        // Check for date override
        const dateOverride = availability.dateOverrides.find(
            override => format(override.date, "yyyy-MM-dd") === dateStr
        )

        if (dateOverride) {
            // Use override times if available
            const slots = generateAvailableTimeSlots(
                dateOverride.startTime,
                dateOverride.endTime,
                event.duration,
                bookings,
                dateStr,
                availability.timeGap
            );
            if (slots.length > 0) {
                availableDates.push({
                    date: dateStr,
                    slots,
                })
            }
        } else {
            // Fall back to regular weekly schedule
            const dayOfWeek = format(date, "EEEE").toUpperCase()
            const dayAvailability = availability.days.find((d) => d.day === dayOfWeek)
            
            if (dayAvailability) {
                const slots = generateAvailableTimeSlots(
                    dayAvailability.startTime,
                    dayAvailability.endTime,
                    event.duration,
                    bookings,
                    dateStr,
                    availability.timeGap
                );
                if (slots.length > 0) {
                    availableDates.push({
                        date: dateStr,
                        slots,
                    })
                }
            }
        }
    }
    return availableDates
}

function generateAvailableTimeSlots(
    startTime,
    endTime,
    duration,
    bookings,
    dateStr,
    timeGap = 0
) {
    const slots = []
    let currentTime = parseISO(
    `${dateStr}T${startTime.toISOString().slice(11, 16)}`
  );
  const slotEndTime = parseISO(
    `${dateStr}T${endTime.toISOString().slice(11, 16)}`
    );
    
    // We will iterate between currentTime and endTime and for each and every single time slot, we will compare if this time slot available, by considering the timeGap, bookings and duration etc., 
// If the date is today, start from the next available slot after the current time
    const now = new Date();
    // But before all of this, we need to make sure we don't show the time slot from the past
  if (format(now, "yyyy-MM-dd") === dateStr) {
    currentTime = isBefore(currentTime, now) // I want to show the slots only after the current time
      ? addMinutes(now, timeGap) // If the timeGap is 2 hours, user can book only after 2 hours
      : currentTime;
  }
// while look will run until currentTime < slotEndTime
    while (currentTime < slotEndTime) {
      // Let's say startTime = 9 am and endTime is 11 am, and the call is for 30 minutes, now we will be generating 4 slots
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
// We need to check if the slot is available
    const isSlotAvailable = !bookings.some((booking) => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
        return (
          // In all these three cases, we will return the slot is not available since we put !bookings.some()
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (currentTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });

    if (isSlotAvailable) {
      slots.push(format(currentTime, "HH:mm"));
    }

    currentTime = slotEnd;
  }

  return slots;
}

export async function updateEvent(eventId, data) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the event belongs to the user
    const existingEvent = await db.event.findFirst({
      where: {
        id: eventId,
        userId: user.id,
      },
    });

    if (!existingEvent) {
      throw new Error("Event not found or unauthorized");
    }

    const validatedData = eventSchema.parse(data);

    const event = await db.event.update({
      where: {
        id: eventId,
      },
      data: {
        ...validatedData,
        inPersonDetails: data.inPersonDetails,
        phoneDetails: data.phoneDetails,
      },
    });

    return { success: true, data: event };
  } catch (error) {
    console.error("Error updating event:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update event" 
    };
  }
}

export async function updateEmailConfig({ eventId, type, subject, body, timings }) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { user: true }
    })

    if (event.user.clerkUserId !== userId) {
      throw new Error("Unauthorized")
    }

    const data = {
      [`${type}Subject`]: subject,
      [`${type}Body`]: body,
    }

    if (timings && (type === 'reminder' || type === 'followup')) {
      data[`${type}Timings`] = timings
    }

    await db.emailConfig.upsert({
      where: { eventId },
      create: {
        eventId,
        ...data
      },
      update: data
    })

    revalidatePath(`/events/${eventId}/emails`)
    return { success: true }
  } catch (error) {
    console.error('[UPDATE_EMAIL_CONFIG_ERROR]', error)
    return { success: false, error: error.message }
  }
}
