import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    try {
        // 1. Create a transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 5000,
            socketTimeout: 15000
        });

        // 2. Define email options
        const mailOptions = {
            from: `MIN NOTE <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.message,
            text: options.text,
        };

        // 3. Send email
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${options.email}`);
    } catch (error) {
        console.error('Nodemailer Error: Failed to send email.', error);
        throw error;
    }
};
