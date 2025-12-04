import crypto from "crypto-js";

export function hashOtp(otp: string, salt: string) {
return crypto.HmacSHA256(otp, salt).toString();
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
}

export function generateSalt(length = 16) {
  return crypto.lib.WordArray.random(length).toString();
}
