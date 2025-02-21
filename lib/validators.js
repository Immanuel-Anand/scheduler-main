import { z } from "zod";

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscore and hyphen"
    ), // This is username schema. min 3 characters and max 20. regex means it should only contain letters, numbers and _
});
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less"),
  duration: z.number().int().positive("Duration must be a positive number"),
  location: z.array(z.string()).min(1, "Please select at least one meeting location"),
  inPersonDetails: z.object({
    venue: z.string().min(1, "Venue is required"),
    address: z.string().optional()
  }).nullable().optional(),
  phoneDetails: z.object({
    callType: z.enum(["host-calls", "invitee-calls"]),
    phoneNumber: z.string().optional()
  }).nullable().optional(),
  isPrivate: z.boolean(),
});

const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)

const daySchema = z.object({
    isAvailable: z.boolean(),
    startTime: timeSchema,
    endTime: timeSchema,
}).refine((data) => {
  if (data.isAvailable) {
    return data.startTime < data.endTime;
  }
  return true;
}, // The end time should be higher than the start time for availability. So, we are doing this check
    {
      message: "End time must be more than start time",
      path: ["endTime"],
})

const holidaySchema = z.object({
    name: z.string().nullable().optional(),
})

export const availabilitySchema = z.object({
    monday: daySchema,
    tuesday: daySchema,
    wednesday: daySchema,
    thursday: daySchema,
    friday: daySchema,
    saturday: daySchema,
    sunday: daySchema,
    timeGap: z.number().min(0).max(120),
    dateOverrides: z.record(z.object({
        isAvailable: z.boolean(),
        startTime: timeSchema,
        endTime: timeSchema,
    })).optional(),
 holidays: z.record(holidaySchema).optional(),
})

export const bookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  additionalInfo: z.string().optional(),
});