import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateSecureSecret } from '../../src/utils';
import { validateSecretKeyStrength } from '../../src/utils/validateSecretKey';

describe('generateSecureSecret', () => {
  it('should generate a secret of the specified length', () => {
    const length = 48;
    const secret = generateSecureSecret(length);
    assert.strictEqual(secret.length, length);
  });

  it('should generate a secret with default length if not specified', () => {
    const secret = generateSecureSecret();
    assert.strictEqual(secret.length, 48); // Default length is 48
  });

  it('should generate a secret with uppercase letters', () => {
    const secret = generateSecureSecret(32);
    assert.match(secret, /[A-Z]/);
  });

  it('should generate a secret with lowercase letters', () => {
    const secret = generateSecureSecret(32);
    assert.match(secret, /[a-z]/);
  });

  it('should generate a secret with numbers', () => {
    const secret = generateSecureSecret(32);
    assert.match(secret, /[0-9]/);
  });

  it('should generate a secret with special characters', () => {
    const secret = generateSecureSecret(32);
    assert.match(secret, /[!@#$%^&*()-_=+[\]{}|;:,.<>?/]/);
  });

  it('should generate a secret that passes validation', () => {
    const secret = generateSecureSecret(48);
    const validation = validateSecretKeyStrength(secret);
    assert.strictEqual(validation.isValid, true, `Secret validation failed: ${validation.reason}`);
  });

  it('should generate different secrets on each call', () => {
    const secret1 = generateSecureSecret(32);
    const secret2 = generateSecureSecret(32);
    assert.notStrictEqual(secret1, secret2);
  });
});