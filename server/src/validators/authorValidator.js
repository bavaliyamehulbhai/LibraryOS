const Joi = require("joi");

exports.createAuthorSchema = Joi.object({
  name: Joi.string().required(),
  biography: Joi.string().allow(""),
  country: Joi.string().allow(""),
  dateOfBirth: Joi.date().allow(null, ""),
  email: Joi.string().email().allow(""),
  website: Joi.string().uri().allow(""),
  image: Joi.string().allow("")
});

exports.updateAuthorSchema = Joi.object({
  name: Joi.string(),
  biography: Joi.string().allow(""),
  country: Joi.string().allow(""),
  dateOfBirth: Joi.date().allow(null, ""),
  email: Joi.string().email().allow(""),
  website: Joi.string().uri().allow(""),
  image: Joi.string().allow("")
}).min(1);
