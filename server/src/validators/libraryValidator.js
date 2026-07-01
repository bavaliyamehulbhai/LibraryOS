const Joi = require("joi");

const createLibrarySchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).optional().allow(''),
  address: Joi.alternatives().try(
    Joi.string().allow(''),
    Joi.object()
  ).optional(),
  city: Joi.string().required(),
  state: Joi.string().optional().allow(''),
  pincode: Joi.string().optional().allow(''),
  adminName: Joi.string().required(),
  adminEmail: Joi.string().email().required()
});

module.exports = {
  createLibrarySchema
};
