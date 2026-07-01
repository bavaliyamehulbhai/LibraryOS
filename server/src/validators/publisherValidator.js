const Joi = require("joi");

exports.createPublisherSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().allow(""),
  phone: Joi.string().allow(""),
  website: Joi.string().uri().allow(""),
  address: Joi.string().allow(""),
  city: Joi.string().allow(""),
  state: Joi.string().allow(""),
  country: Joi.string().allow(""),
  logo: Joi.string().allow(""),
  description: Joi.string().allow("")
});

exports.updatePublisherSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email().allow(""),
  phone: Joi.string().allow(""),
  website: Joi.string().uri().allow(""),
  address: Joi.string().allow(""),
  city: Joi.string().allow(""),
  state: Joi.string().allow(""),
  country: Joi.string().allow(""),
  logo: Joi.string().allow(""),
  description: Joi.string().allow("")
}).min(1);
