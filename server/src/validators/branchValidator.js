const Joi = require("joi");

const createBranchSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.any().optional(),
  city: Joi.string().required(),
  state: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  managerId: Joi.string().optional(),
  libraryId: Joi.string().optional()
});

const updateBranchSchema = Joi.object({
  name: Joi.string().optional(),
  address: Joi.any().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
  managerId: Joi.string().optional()
});

module.exports = {
  createBranchSchema,
  updateBranchSchema
};
