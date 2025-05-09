import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateSecretKeyStrength } from '../../src/utils/validateSecretKey';

describe('validateSecretKeyStrength', () => {
  it('should validate a strong secret key', () => {
    const strongKey = 'aB1!cD2@eF3#gH4$iJ5%kL6^mN7&oP8*qR9(sT0)';
    const result = validateSecretKeyStrength(strongKey);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.reason, undefined);
  });

  it('should reject a key that is too short', () => {
    const shortKey = 'aB1!cD2@';
    const result = validateSecretKeyStrength(shortKey);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.reason, 'Secret key must be at least 32 characters long');
  });

  it('should reject a key without special characters when required', () => {
    const noSpecialCharsKey = 'abcDEF123456789012345678901234567890';
    const result = validateSecretKeyStrength(noSpecialCharsKey);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.reason, 'Secret key must contain at least one special character');
  });

  it('should reject a key without numbers when required', () => {
    const noNumbersKey = 'abcDEFghiJKLmnoPQRstuVWXyz!@#$%^&*()';
    const result = validateSecretKeyStrength(noNumbersKey);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.reason, 'Secret key must contain at least one number');
  });

  it('should reject a key without uppercase letters when required', () => {
    const noUppercaseKey = 'abcdefghi123456789!@#$%^&*()_+-=';
    const result = validateSecretKeyStrength(noUppercaseKey);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.reason, 'Secret key must contain at least one uppercase letter');
  });

  it('should reject a key without lowercase letters when required', () => {
    const noLowercaseKey = 'ABCDEFGHI123456789!@#$%^&*()_+-=';
    const result = validateSecretKeyStrength(noLowercaseKey);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.reason, 'Secret key must contain at least one lowercase letter');
  });

  it('should reject a key with common patterns when disallowed', () => {
    const commonPatternKey = 'ABCDEFGHIpassword123!@#$%^&*()_+-=';
    const result = validateSecretKeyStrength(commonPatternKey);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.reason?.includes('common pattern'));
  });

  it('should accept a key that meets custom requirements', () => {
    const customKey = 'ABCDEFGHI123456789';
    const result = validateSecretKeyStrength(customKey, {
      minLength: 16,
      requireSpecialChars: false,
      requireLowercase: false,
      disallowCommonPatterns: false
    });
    assert.strictEqual(result.isValid, true);
  });

  it('should reject a key with low entropy', () => {
    const lowEntropyKey = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA!1A';
    const result = validateSecretKeyStrength(lowEntropyKey);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.reason, 'Secret key has insufficient entropy (randomness)');
  });
});