const Joi = require("joi");

exports.createCategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  parentCategory: Joi.string().allow(null, ""),
  color: Joi.string().allow(""),
  icon: Joi.string().allow("")
});

exports.updateCategorySchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(""),
  parentCategory: Joi.string().allow(null, ""),
  color: Joi.string().allow(""),
  icon: Joi.string().allow("")
}).min(1);
