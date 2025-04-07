const baseUrl = process.env.API_URL;
export const SEND_OTP_URL = `${baseUrl}/auth/send-otp`;
export const VERIFY_OTP_URL = `${baseUrl}/auth/verify-otp`;
export const GET_CUSTODIANS_URL = `${baseUrl}/api/exchanges`;
export const GET_USER = `${baseUrl}/api/user`;

export const CUSTODIAN_USER_VERIFICATION_URL = (baseUrl: string, email: string) => `${baseUrl}user/verify/${email}`;
export const CUSTODIAN_ASSETS = (baseUrl: string) => `${baseUrl}/assets`;
export const CUSTODIAN_INCLUSION_PROOFS = (baseUrl: string) => `${baseUrl}/proof/get`;
export const CUSTODIAN_GET_CONTRACTS = (baseUrl: string) => `${baseUrl}/contracts`;
export const CUSTODIAN_GET_PROOF = (baseUrl: string) => `${baseUrl}/downloadProof`;