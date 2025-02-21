import { db } from "../../../../../lib/prisma"
import EmailConfigForm from "./_components/emailConfigForm"
import { notFound } from "next/navigation"

export default async function EventEmailsPage({ params }) {
  const {eventId} = await params

  if (!eventId) {
    notFound()
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      emailConfig: true
    }
  })

  if (!event) {
    notFound()
  }

  const defaultConfirmationSubject = "Confirmed: {{event_name}} with {{my_name}} on {{event_date}}"
  const defaultConfirmationBody = `Hi {{invitee_full_name}},

Thanks for reaching out.
Your {{event_name}} with {{my_name}} at {{event_time}} on {{event_date}} is scheduled.
{{event_description}}
{{location}}
{{questions_and_answers}}`

  const defaultCancellationSubject = "Cancelled: {{event_name}} on {{event_date}}"
  const defaultCancellationBody = `Hi {{invitee_full_name}},

This email confirms that your {{event_name}} with {{my_name}} on {{event_date}} at {{event_time}} has been cancelled.

You can schedule a new meeting at your convenience: {{scheduling_link}}

Best regards,
{{my_name}}`

  const defaultReminderSubject = "Reminder: {{event_name}} with {{my_name}} starts in {{time_before_event}}"
  const defaultReminderBody = `Hi {{invitee_full_name}},

This is a reminder that your {{event_name}} with {{my_name}} starts in {{time_before_event}}.

Date & Time: {{event_date}} at {{event_time}}
{{location}}

Looking forward to our meeting!

Best regards,
{{my_name}}`

  const defaultFollowupSubject = "Thank you for attending {{event_name}}"
  const defaultFollowupBody = `Hi {{invitee_full_name}},

Thank you for attending the {{event_name}} with {{my_name}}.

We hope the session was valuable for you. If you have any questions or need further assistance, please don't hesitate to reach out.

To schedule another meeting, you can use this link: {{scheduling_link}}

Best regards,
{{my_name}}`

  console.log('Default values being passed:', {
    confirmation: {
      subject: event.emailConfig?.confirmationSubject || defaultConfirmationSubject,
      body: event.emailConfig?.confirmationBody || defaultConfirmationBody
    }
  })

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Email Settings</h2>
      <EmailConfigForm 
        event={event} 
        defaultValues={{
          confirmation: {
            subject: event.emailConfig?.confirmationSubject || defaultConfirmationSubject,
            body: event.emailConfig?.confirmationBody || defaultConfirmationBody
          },
          cancellation: {
            subject: event.emailConfig?.cancellationSubject || defaultCancellationSubject,
            body: event.emailConfig?.cancellationBody || defaultCancellationBody
          },
          reminder: {
            subject: event.emailConfig?.reminderSubject || defaultReminderSubject,
            body: event.emailConfig?.reminderBody || defaultReminderBody,
            timings: event.emailConfig?.reminderTimings || [24]
          },
          followup: {
            subject: event.emailConfig?.followupSubject || defaultFollowupSubject,
            body: event.emailConfig?.followupBody || defaultFollowupBody,
            timings: event.emailConfig?.followupTimings || [24]
          }
        }}
      />
    </div>
  )
}