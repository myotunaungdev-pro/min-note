import { Resend } from 'resend';

// Reusable utility function to dispatch emails via the Resend API
export const sendEmail = async (options) => {
    try {
        // Initialize the Resend client with the environment API key
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Construct and send the email payload
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: options.email,
            subject: options.subject,
            html: options.message,
            text: options.text,
        });

        // Handle specific API-level errors returned by Resend
        if (error) {
            console.error('Resend API Error: Failed to send email.', error);
            return;
        }

        console.log(`Email successfully sent to ${options.email}`);
    } catch (error) {
        // Catch any unexpected exceptions during the sending process
        console.error('Email Sending Error: Failed to send email.', error);

        // Fail silently so that non-critical email failures do not interrupt core user flows (like signup)
    }
};