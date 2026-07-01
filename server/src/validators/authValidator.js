const validator = require("validator");

const validateRegister = (data) => {
  const errors = [];

  if (!data.name) {
    errors.push("Name is required");
  }

  if (!data.email) {
    errors.push("Email is required");
  } else if (!validator.isEmail(data.email)) {
    errors.push("Invalid Email");
  }

  if (!data.password) {
    errors.push("Password is required");
  } else if (!validator.isStrongPassword(data.password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })) {
    errors.push("Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character");
  }

  if (!data.role) {
    errors.push("Role is required");
  }

  if (!data.libraryId) {
    errors.push("Library ID is required");
  }

  return errors;
};

module.exports = {
  validateRegister
};
