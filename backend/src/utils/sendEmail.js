import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    try {
        // 1. Create a transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
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
