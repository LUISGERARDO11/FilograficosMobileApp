// __tests__/components/LoginValidation.test.tsx
import { isFormValid, isValidEmail, isValidPassword } from '../../utils/validation';

describe('Login Validation', () => {
  describe('isValidEmail', () => {
    it('debería validar email correcto', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user@domain.co')).toBe(true);
      expect(isValidEmail('name+tag@gmail.com')).toBe(true);
    });

    it('debería rechazar emails inválidos', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('no@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('debería manejar casos edge', () => {
      expect(isValidEmail(' ')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('debería considerar password válido si tiene longitud > 0', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('a')).toBe(true);
    });

    it('debería considerar password inválido si está vacío', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('   ')).toBe(false);
    });
  });

  describe('isFormValid', () => {
    it('debería requerir ambos campos válidos', () => {
      expect(isFormValid('test@example.com', 'pass123')).toBe(true);
      expect(isFormValid('test@example.com', '')).toBe(false);
      expect(isFormValid('', 'pass123')).toBe(false);
      expect(isFormValid('', '')).toBe(false);
    });
  });
});