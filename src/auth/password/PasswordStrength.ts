export const getPasswordStrength = (pwd: string) => pwd.length >= 8 ? "STRONG" : "WEAK";
