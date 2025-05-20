/**
 * Validates the strength of a secret key used for JWT signing
 * 
 * @param secretKey - The secret key to validate
 * @param options - Configuration options for validation
 * @returns An object with validation result and reason if invalid
 */
export function validateSecretKeyStrength(
  secretKey: string,
  options: {
    minLength?: number;
    requireSpecialChars?: boolean;
    requireNumbers?: boolean;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    disallowCommonPatterns?: boolean;
  } = {}
): { isValid: boolean; reason?: string } {
  // Set default options
  const {
    minLength = 32,
    requireSpecialChars = true,
    requireNumbers = true,
    requireUppercase = true,
    requireLowercase = true,
    disallowCommonPatterns = true,
  } = options;

  // Check minimum length
  if (!secretKey || secretKey.length < minLength) {
    return {
      isValid: false,
      reason: `Secret key must be at least ${minLength} characters long`,
    };
  }

  // Check for special characters if required
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(secretKey)) {
    return {
      isValid: false,
      reason: 'Secret key must contain at least one special character',
    };
  }

  // Check for numbers if required
  if (requireNumbers && !/\d/.test(secretKey)) {
    return {
      isValid: false,
      reason: 'Secret key must contain at least one number',
    };
  }

  // Check for uppercase letters if required
  if (requireUppercase && !/[A-Z]/.test(secretKey)) {
    return {
      isValid: false,
      reason: 'Secret key must contain at least one uppercase letter',
    };
  }

  // Check for lowercase letters if required
  if (requireLowercase && !/[a-z]/.test(secretKey)) {
    return {
      isValid: false,
      reason: 'Secret key must contain at least one lowercase letter',
    };
  }

  // Check for common patterns if required
  if (disallowCommonPatterns) {
    const commonPatterns = [
      'secret',
      'password',
      'key',
      '12345',
      'qwerty',
      'abcdef',
      'test',
      'development',
    ];

    const lowercaseKey = secretKey.toLowerCase();
    for (const pattern of commonPatterns) {
      if (lowercaseKey.includes(pattern)) {
        return {
          isValid: false,
          reason: `Secret key contains a common pattern: "${pattern}"`,
        };
      }
    }
  }

  // Check for entropy (randomness)
  const entropyScore = calculateEntropyScore(secretKey);
  if (entropyScore < 3.5) {
    return {
      isValid: false,
      reason: 'Secret key has insufficient entropy (randomness)',
    };
  }

  return { isValid: true };
}

/**
 * Calculates a basic entropy score for a string
 * Higher scores indicate more randomness
 * 
 * @param str - The string to analyze
 * @returns A numerical entropy score
 */
function calculateEntropyScore(str: string): number {
  const charFrequency: Record<string, number> = {};

  // Count character frequencies
  for (const char of str) {
    charFrequency[char] = (charFrequency[char] || 0) + 1;
  }

  // Calculate entropy using Shannon's formula
  let entropy = 0;
  const length = str.length;

  for (const char in charFrequency) {
    const probability = charFrequency[char] / length;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}