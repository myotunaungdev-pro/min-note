import { Resend } from 'resend';

export const sendEmail = async (options) => {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: options.email,
            subject: options.subject,
            html: options.message,
            text: options.text,
        });

        if (error) {
            console.error('Resend API Error: Failed to send email.', error);
            return;
        }

        console.log(`Email successfully sent to ${options.email}`);
    } catch (error) {
        console.error('Email Sending Error: Failed to send email.', error);
        // Do not throw error to prevent crashing the signup process
    }
};
