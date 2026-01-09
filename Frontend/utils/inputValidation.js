// Input validation utilities

export const validateName = (text) => {
  // Only allow letters and spaces, but no leading/trailing spaces
  return text.replace(/[^a-zA-Z\s]/g, '').replace(/^\s+|\s+$/g, '');
};

export const validateAlphabetic = (text) => {
  // Only allow letters, no spaces
  return text.replace(/[^a-zA-Z]/g, '');
};

export const validateNumeric = (text) => {
  // Only allow numbers
  return text.replace(/[^0-9]/g, '');
};

export const validatePhone = (text) => {
  // Only allow numbers, limit to 10 digits
  const cleaned = text.replace(/[^0-9]/g, '');
  return cleaned.slice(0, 10);
};

export const validatePincode = (text) => {
  // Only allow numbers, limit to 6 digits
  const cleaned = text.replace(/[^0-9]/g, '');
  return cleaned.slice(0, 6);
};

export const validateAddress = (text) => {
  // Allow letters, numbers, spaces, commas, periods, hyphens
  return text.replace(/[^a-zA-Z0-9\s,.\-]/g, '');
};

export const validateEmail = (text) => {
  // Allow email valid characters
  return text.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase();
};

export const formatName = (text) => {
  // Capitalize first letter of each word, remove extra spaces
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
