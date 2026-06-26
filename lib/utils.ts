import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_LEAD_ENCRYPTION_KEY || "journey_os_secret_key";

export function encryptLeadData(data: string): string {
  if (!data) return "";
  try {
    // Reversible Base64-XOR cipher
    let result = "";
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    if (typeof window !== "undefined") {
      return window.btoa(result);
    } else {
      return Buffer.from(result, "binary").toString("base64");
    }
  } catch (e) {
    return data;
  }
}

export function decryptLeadData(encoded: string): string {
  if (!encoded) return "";
  try {
    // Check base64 format validity
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(encoded) || encoded.length % 4 !== 0) {
      return encoded; // Not base64
    }
    let decoded = "";
    if (typeof window !== "undefined") {
      decoded = window.atob(encoded);
    } else {
      decoded = Buffer.from(encoded, "base64").toString("binary");
    }
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    // Verify results is printable phone/email
    const safeRegex = /^[+\w\s@.()-]+$/;
    if (safeRegex.test(result)) {
      return result;
    }
    return encoded;
  } catch (e) {
    return encoded;
  }
}
