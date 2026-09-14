export const checkEnvVariables = () => {
    const requiredCore = ['MONGO_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
    let hasFatalError = false;

    for (const key of requiredCore) {
        if (!process.env[key]) {
            console.error(`FATAL ERROR: Missing core environment variable: ${key}`);
            hasFatalError = true;
        }
    }

    if (hasFatalError) {
        console.error("Exiting due to missing core environment variables.");
        process.exit(1);
    }

    const emailVars = ['RESEND_API_KEY', 'EMAIL_FROM', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    for (const key of emailVars) {
        if (!process.env[key]) {
            console.warn(`WARNING: Missing email-related environment variable: ${key}`);
        }
    }
};
