import { db } from '../../../../lib/prisma';
import { sendEventEmail } from '../../../../lib/resend';
import { format, differenceInHours } from 'date-fns';

export async function POST(req) {
  try {
    // Get all upcoming bookings with reminder emails enabled
    const bookings = await db.booking.findMany({
      where: {
        startTime: {
          gt: new Date(),
        },
        event: {
          emailConfig: {
            reminderEnabled: true,
          },
        },
      },
      include: {
        event: {
          include: {
            emailConfig: true,
            user: true,
          },
        },
      },
    });

    for (const booking of bookings) {
      const hoursUntilEvent = differenceInHours(booking.startTime, new Date());
      
      // Check if we should send a reminder for any of the configured timings
      const shouldSendReminder = booking.event.emailConfig.reminderTimings.some(
        timing => Math.abs(hoursUntilEvent - timing) < 1
      );

      if (shouldSendReminder) {
        const emailData = {
          eventName: booking.event.title,
          myName: booking.event.user.name,
          eventDate: format(booking.startTime, 'MMMM d, yyyy'),
          eventTime: format(booking.startTime, 'h:mm a'),
          inviteeFullName: booking.name,
          eventDescription: booking.event.description,
          location: booking.location,
          timeBeforeEvent: `${hoursUntilEvent} hours`,
        };

        await sendEventEmail(
          booking.email,
          booking.event.emailConfig,
          emailData,
          'reminder'
        );
      }
    }

    return new Response('Reminder emails sent successfully', { status: 200 });
  } catch (error) {
    console.error('Error sending reminder emails:', error);
    return new Response('Error sending reminder emails', { status: 500 });
  }
} 