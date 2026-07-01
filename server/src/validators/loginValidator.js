const validator = require("validator");

const validateLogin = (data) => {
 const errors = [];

 if (!data.email) {
   errors.push("Email is required");
 } else if (!validator.isEmail(data.email)) {
   errors.push("Invalid Email");
 }

 if (!data.password) {
   errors.push("Password is required");
 }

 return errors;
};

module.exports = {
  validateLogin
};
