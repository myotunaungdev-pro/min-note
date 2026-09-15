export const checkEnvVariables = () => {
    // Define the absolute minimum environment variables required for the app to boot
    const requiredCore = ['MONGO_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
    let hasFatalError = false;

    // Iterate through core variables and flag any that are missing
    for (const key of requiredCore) {
        if (!process.env[key]) {
            console.error(`FATAL ERROR: Missing core environment variable: ${key}`);
            hasFatalError = true;
        }
    }

    // Terminate the application immediately if any core variables are missing
    if (hasFatalError) {
        console.error("Exiting due to missing core environment variables.");
        process.exit(1);
    }

    // Define optional environment variables needed for email functionality
    const emailVars = ['RESEND_API_KEY', 'EMAIL_FROM', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    
    // Warn the developer if email variables are missing, but do not stop the app
    for (const key of emailVars) {
        if (!process.env[key]) {
            console.warn(`WARNING: Missing email-related environment variable: ${key}`);
        }
    }
};
