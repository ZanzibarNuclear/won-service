import path from 'path'
export { validateSecretKeyStrength } from './validateSecretKey'

/**
 * Generates a random string of specified length
 * @param length - Length of the random string to generate
 * @returns A random string
 */
function generateRandomString(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    randomString += characters.charAt(randomIndex)
  }
  return randomString
}

/**
 * Generates a random key of specified length
 * @param digits - Number of characters in the key
 * @returns A random key string
 */
export const genKey = (digits = 10) => {
  return generateRandomString(digits)
}

/**
 * Generates a cryptographically secure random string suitable for secrets
 * Includes uppercase, lowercase, numbers, and special characters
 * 
 * @param length - Length of the secret to generate (default: 48)
 * @returns A secure random string
 */
export const generateSecureSecret = (length = 48): string => {
  // Define character sets
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?/';
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;

  let result = '';
  let randomBytes: Uint8Array;

  // In a browser environment, use Web Crypto API
  if (typeof window !== 'undefined' && window.crypto) {
    randomBytes = new Uint8Array(length * 2); // Get extra bytes to ensure we have enough
    window.crypto.getRandomValues(randomBytes);
  }
  // In Node.js environment, use crypto module
  else if (typeof require !== 'undefined') {
    try {
      const crypto = require('crypto');
      randomBytes = crypto.randomBytes(length * 2);
    } catch (err) {
      console.error('Failed to generate secure secret using crypto:', err);
      // Fallback to less secure method with a warning
      console.warn('WARNING: Using less secure random generation method');
      return generateRandomString(length);
    }
  }
  // Fallback with warning
  else {
    console.warn('WARNING: Secure random generation not available, using less secure method');
    return generateRandomString(length);
  }

  // Ensure at least one character from each required set
  result += uppercaseChars[randomBytes[0] % uppercaseChars.length];
  result += lowercaseChars[randomBytes[1] % lowercaseChars.length];
  result += numberChars[randomBytes[2] % numberChars.length];
  result += specialChars[randomBytes[3] % specialChars.length];

  // Fill the rest with random characters from all sets
  for (let i = 4; i < length; i++) {
    const randomIndex = randomBytes[i] % allChars.length;
    result += allChars[randomIndex];
  }

  // Shuffle the result to avoid predictable positions of character types
  return shuffleString(result, randomBytes.slice(length));
}

/**
 * Shuffles a string using Fisher-Yates algorithm with provided random bytes
 * 
 * @param str - The string to shuffle
 * @param randomBytes - Random bytes to use for shuffling
 * @returns The shuffled string
 */
function shuffleString(str: string, randomBytes: Uint8Array): string {
  const arr = str.split('');

  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomBytes[i % randomBytes.length] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }

  return arr.join('');
}

/**
 * Adjusts profile image paths by prepending the image view path
 * @param profile - User profile object
 * @param imageViewPath - Base path for image viewing
 * @returns Updated profile with adjusted image paths
 */
export const adjustProfileImagePaths = (profile: any, imageViewPath: string) => {
  if (!profile) return null;

  return Object.assign({}, profile, {
    avatar: profile.avatar ? path.join(imageViewPath, profile.avatar) : null,
    glamShot: profile.glamShot ? path.join(imageViewPath, profile.glamShot) : null
  })
}
