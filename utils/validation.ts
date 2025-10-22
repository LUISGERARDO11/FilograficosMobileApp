// utils/validation.ts
export const isValidEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);

export const isValidPassword = (password: string): boolean => password.trim().length > 0;

export const isFormValid = (email: string, password: string): boolean => {
  return isValidEmail(email) && isValidPassword(password);
};