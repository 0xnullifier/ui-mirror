const baseUrl = "http://localhost:8000";
export const SEND_OTP_URL = `${baseUrl}/auth/send-otp`;
export const VERIFY_OTP_URL = `${baseUrl}/auth/verify-otp`;
export const GET_CUSTODIANS_URL = `${baseUrl}/api/exchanges`;

export const CUSTODIAN_USER_VERIFICATION_URL = (baseUrl: string, email: string) => `${baseUrl}user/verify/${email}`;
export const CUSTODIAN_ASSETS = (baseUrl: string) => `${baseUrl}assets`;