"use server";

import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { createZoomMeeting } from "@/lib/zoom";
import { sendEventEmail } from '@/lib/resend';
import { format } from 'date-fns';

// Step 1: Check if the event isExists,
//     STpe 2: Schedule the event on users Calendar
// stpe 3: add the booked event into our db and google meet
export async function createBooking(bookingData) {
  try {
    if (!bookingData) {
      throw new Error("Booking data is required");
    }
    // Fetch the event and its creator
    const event = await db.event.findUnique({
      where: { id: bookingData.eventId },
      include: { user: true },
    });

    if (!event) {
      throw new Error("Event not found");
    }
    // use google calendar api to generate meet link and add to calendar 
   console.log(bookingData.addGuestEmails);

    let meetingDetails = null;

    // If event has Zoom location and user has Zoom connected
    if (
      event.location.includes('zoom') && 
      event.user.zoomAccessToken
    ) {
      // Create Zoom meeting
      meetingDetails = await createZoomMeeting(
        event.user,
        event,
        bookingData.startTime,
        event.duration
      );
    }

    // Create booking in database
    const booking = await db.booking.create({
      data: {
        eventId: event.id,
        userId: event.userId,
        name: bookingData.name,
        email: bookingData.email,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        customQAnswers: bookingData.customQAnswers || null,
        addGuestEmails: bookingData.addGuestEmails || [], // Changed to match the state variable name
        timezone: bookingData.timezone || null,
        location: bookingData.location || null,
        suggestedLocation: bookingData.suggestedLocation || null,
        phoneNumber: bookingData.phoneNumber || null,
        firstName: bookingData.firstName || null,
        lastName: bookingData.lastName || null,
        zoomMeetingId: meetingDetails?.meetingId,
        zoomMeetingUrl: meetingDetails?.meetingUrl,
        zoomMeetingPassword: meetingDetails?.password,
      },
      include: {
        event: {
          include: {
            emailConfig: true,
            user: true
          }
        }
      }
    });

    // If booking is created successfully, send confirmation email
    if (booking && booking.event.emailConfig) {
      const emailData = {
        eventName: booking.event.title,
        myName: booking.event.user.name,
        eventDate: format(booking.startTime, 'MMMM d, yyyy'),
        eventTime: format(booking.startTime, 'h:mm a'),
        inviteeFullName: bookingData.firstName && bookingData.lastName 
          ? `${bookingData.firstName} ${bookingData.lastName}`
          : bookingData.name,
        eventDescription: booking.event.description,
        location: booking.location,
        questionsAndAnswers: formatQuestionsAndAnswers(bookingData.customQAnswers),
        schedulingLink: `${process.env.NEXT_PUBLIC_APP_URL}/book/${booking.event.user.username}/${booking.event.id}`,
      };

      await sendEventEmail(
        bookingData.email,
        booking.event.emailConfig,
        emailData,
        'confirmation'
      );

      // If guest emails are provided, send them confirmation emails too
      if (bookingData.addGuestEmails?.length > 0) {
        for (const guestEmail of bookingData.addGuestEmails) {
          await sendEventEmail(
            guestEmail,
            booking.event.emailConfig,
            emailData,
            'confirmation'
          );
        }
      }
    }

    return { success: true, booking};
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
}

function formatQuestionsAndAnswers(answers) {
  if (!answers) return '';
  
  return Object.entries(answers)
    .map(([question, answer]) => `${question}: ${answer}`)
    .join('\n');
}

