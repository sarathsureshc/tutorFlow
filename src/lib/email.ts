/**
 * Email Notification Service (Bonus Feature)
 * Integrates with Resend / console logger for session scheduling notifications
 */

interface SessionNotificationParams {
  studentEmail: string;
  studentName: string;
  tutorName: string;
  topic: string;
  scheduledAt: Date;
  durationMins: number;
}

export async function sendSessionScheduledEmail(params: SessionNotificationParams) {
  const { studentEmail, studentName, tutorName, topic, scheduledAt, durationMins } = params;
  const resendApiKey = process.env.RESEND_API_KEY;

  const dateStr = scheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const emailBody = `
Hello ${studentName},

Your tutor ${tutorName} has scheduled a new 1:1 tutoring session on TutorFlow!

• Topic: ${topic}
• Date & Time: ${dateStr}
• Duration: ${durationMins} minutes

Please log in to your TutorFlow learning hub to review your preparatory materials:
https://tutorflow.com/student/dashboard

Best regards,
TutorFlow Notifications
`;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TutorFlow <notifications@tutorflow.com>",
          to: [studentEmail],
          subject: `📅 New Tutoring Session Scheduled: ${topic}`,
          text: emailBody,
        }),
      });

      if (response.ok) {
        console.log(`✉️ Email notification dispatched via Resend to ${studentEmail}`);
        return { success: true, dispatched: "resend" };
      }
    } catch (err) {
      console.warn("Failed to dispatch via Resend API, logging email to console:", err);
    }
  }

  // Graceful development / demo logger
  console.log("==================================================");
  console.log(`✉️ [SIMULATED EMAIL NOTIFICATION -> ${studentEmail}]`);
  console.log(`Subject: 📅 New Tutoring Session Scheduled: ${topic}`);
  console.log(emailBody.trim());
  console.log("==================================================");

  return { success: true, dispatched: "simulated" };
}
