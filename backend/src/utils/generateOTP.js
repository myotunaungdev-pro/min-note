// Generates a cryptographically insecure but functional 6-digit One-Time Password
export const generateOTP = () => {
    // Math.random returns a float between 0 and 1, which is scaled and offset to always be 6 digits
    return Math.floor(100000 + Math.random() * 900000).toString();
};
