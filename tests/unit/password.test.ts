import { describe, expect, it } from 'bun:test';
import { hashPassword, comparePassword } from '@/utils/password';

describe('Password Utility', () => {
  it('should securely hash a plaintext password', async () => {
    const raw = 'SuperSecret123!';
    const hashed = await hashPassword(raw);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(raw);
    expect(hashed.startsWith('$2')).toBe(true);
  });

  it('should correctly verify a valid password', async () => {
    const raw = 'PasswordTest!99';
    const hashed = await hashPassword(raw);

    const isMatch = await comparePassword(raw, hashed);
    expect(isMatch).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const raw = 'CorrectPassword123!';
    const hashed = await hashPassword(raw);

    const isMatch = await comparePassword('WrongPassword!', hashed);
    expect(isMatch).toBe(false);
  });
});
