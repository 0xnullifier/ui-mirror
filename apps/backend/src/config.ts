export const config = {
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.example.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER || 'your-email@example.com',
    SMTP_PASS: process.env.SMTP_PASS || 'your-password',
    OTP_EXPIRY_MINUTES: 10,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie-secret',
};
console.log(config)