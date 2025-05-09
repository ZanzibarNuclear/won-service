#!/usr/bin/env node

/**
 * Utility script to generate secure secrets for JWT and other authentication mechanisms
 * 
 * Usage:
 *   node generate-secret.js [length]
 * 
 * Example:
 *   node generate-secret.js 64
 */

const crypto = require('crypto');

// Get the desired length from command line arguments or use default
const length = process.argv[2] ? parseInt(process.argv[2], 10) : 48;

if (isNaN(length) || length < 32) {
  console.error('Error: Length must be a number >= 32');
  process.exit(1);
}

/**
 * Generates a cryptographically secure random string with high entropy
 * that includes uppercase, lowercase, numbers, and special characters
 * 
 * @param {number} length - The desired length of the secret
 * @returns {string} A secure random string
 */
function generateSecureSecret(length) {
  // Define character sets
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

  // Combine all character sets
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;

  // Generate random bytes
  const randomBytes = crypto.randomBytes(length * 2); // Get extra bytes to ensure we have enough

  let result = '';

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
  return shuffleString(result);
}

/**
 * Shuffles a string using Fisher-Yates algorithm
 * 
 * @param {string} str - The string to shuffle
 * @returns {string} The shuffled string
 */
function shuffleString(str) {
  const arr = str.split('');
  const randomBytes = crypto.randomBytes(arr.length);

  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomBytes[i] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }

  return arr.join('');
}

// Generate and output the secret
const secret = generateSecureSecret(length);

// Verify the secret meets our requirements
const hasUppercase = /[A-Z]/.test(secret);
const hasLowercase = /[a-z]/.test(secret);
const hasNumber = /[0-9]/.test(secret);
const hasSpecial = /[!@#$%^&*()-_=+[\]{}|;:,.<>?/]/.test(secret);

console.log('\nGenerated Secret Key:');
console.log('---------------------');
console.log(secret);
console.log('\nSecret characteristics:');
console.log(`- Length: ${secret.length} characters`);
console.log(`- Contains uppercase letters: ${hasUppercase ? 'Yes' : 'No'}`);
console.log(`- Contains lowercase letters: ${hasLowercase ? 'Yes' : 'No'}`);
console.log(`- Contains numbers: ${hasNumber ? 'Yes' : 'No'}`);
console.log(`- Contains special characters: ${hasSpecial ? 'Yes' : 'No'}`);
console.log('\nAdd this to your .env file:');
console.log('JWT_SECRET_KEY=' + secret);
console.log('\n');