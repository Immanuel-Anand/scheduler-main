import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);
const resend = new Resend(re_QRhptNFL_CnZvANo8AKdSeuSi7ZpCYP9K);

export async function sendEventEmail(to, emailConfig, emailData, type) {
  try {
    // Get the appropriate subject and body based on type
    const subject = emailConfig[`${type}Subject`];
    const body = emailConfig[`${type}Body`];
    
    // Replace variables in subject and body
    const replacedSubject = replaceVariables(subject, emailData);
    const replacedBody = replaceVariables(body, emailData);

    // Add cancellation policy if enabled
    const fullBody = emailConfig[`${type}CancellationPolicy`] 
      ? `${replacedBody}\n\nCancellation Policy:\n${emailConfig[`${type}CancellationPolicy`]}`
      : replacedBody;

    // Add cancel/reschedule links if enabled
    const finalBody = emailConfig[`${type}IncludeCancelLinks`]
      ? `${fullBody}\n\nNeed to make changes?\nCancel: {{cancel_link}}\nReschedule: {{reschedule_link}}`
      : fullBody;

    const { data, error } = await resend.emails.send({
      from: emailConfig.replyTo === 'host' 
        ? `${emailData.myName} <onboarding@resend.dev>` // Replace with your verified domain
        : 'No Reply <noreply@yourdomain.com>', // Replace with your verified domain
      to,
      subject: replacedSubject,
      text: finalBody, // Plain text version
      html: convertToHtml(finalBody), // HTML version
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

function replaceVariables(text, data) {
  return text
    .replace(/{{event_name}}/g, data.eventName)
    .replace(/{{my_name}}/g, data.myName)
    .replace(/{{event_date}}/g, data.eventDate)
    .replace(/{{event_time}}/g, data.eventTime)
    .replace(/{{invitee_full_name}}/g, data.inviteeFullName)
    .replace(/{{event_description}}/g, data.eventDescription || '')
    .replace(/{{location}}/g, data.location || '')
    .replace(/{{questions_and_answers}}/g, data.questionsAndAnswers || '')
    .replace(/{{scheduling_link}}/g, data.schedulingLink || '')
    .replace(/{{time_before_event}}/g, data.timeBeforeEvent || '');
}

function convertToHtml(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
} 