/**
 * Validates an ISBN-10 string using Mod 11 checksum
 * @param {string} isbn 
 * @returns {boolean}
 */
const validateIsbn10 = (isbn) => {
  if (isbn.length !== 10) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    if (!/^\d$/.test(isbn[i])) return false;
    sum += parseInt(isbn[i], 10) * (10 - i);
  }

  let checksum = isbn[9].toUpperCase();
  if (checksum === 'X') {
    sum += 10;
  } else if (/^\d$/.test(checksum)) {
    sum += parseInt(checksum, 10);
  } else {
    return false;
  }

  return sum % 11 === 0;
};

/**
 * Validates an ISBN-13 string using Mod 10 checksum
 * @param {string} isbn 
 * @returns {boolean}
 */
const validateIsbn13 = (isbn) => {
  if (isbn.length !== 13) return false;
  if (!/^\d{13}$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(isbn[12], 10);
};

/**
 * Validates if a given string is a valid ISBN-10 or ISBN-13
 * Strips out hyphens and spaces automatically
 * @param {string} isbn 
 * @returns {boolean}
 */
const isValidISBN = (isbn) => {
  if (!isbn || typeof isbn !== 'string') return false;
  
  const cleanIsbn = isbn.replace(/[-\s]/g, '');

  if (cleanIsbn.length === 10) {
    return validateIsbn10(cleanIsbn);
  } else if (cleanIsbn.length === 13) {
    return validateIsbn13(cleanIsbn);
  }

  return false;
};

module.exports = {
  isValidISBN,
  validateIsbn10,
  validateIsbn13
};
