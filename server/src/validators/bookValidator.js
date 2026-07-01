const Joi = require("joi");
const { validateISBN, formatISBN } = require("../services/isbnService");

const isbnValidationMethod = (value, helpers) => {
  if (!validateISBN(value)) {
    return helpers.message("Invalid ISBN-10 or ISBN-13 format");
  }
  return formatISBN(value); // Automatically clean it up for the DB
};

const createBookSchema = Joi.object({
  title: Joi.string().required(),
  subtitle: Joi.string().allow(""),
  isbn: Joi.string().custom(isbnValidationMethod, "ISBN Validation").required(),
  author: Joi.string().allow(""),
  category: Joi.string().allow(""),
  publisher: Joi.string().allow(""),
  edition: Joi.string().allow(""),
  language: Joi.string().default("English"),
  publicationYear: Joi.number().integer().allow(null),
  pages: Joi.number().integer().allow(null),
  description: Joi.string().allow(""),
  coverImage: Joi.string().allow("")
});

const updateBookSchema = Joi.object({
  title: Joi.string(),
  subtitle: Joi.string().allow(""),
  isbn: Joi.string().custom(isbnValidationMethod, "ISBN Validation"),
  author: Joi.string().allow(""),
  category: Joi.string().allow(""),
  publisher: Joi.string().allow(""),
  edition: Joi.string().allow(""),
  language: Joi.string(),
  publicationYear: Joi.number().integer().allow(null),
  pages: Joi.number().integer().allow(null),
  description: Joi.string().allow(""),
  coverImage: Joi.string().allow("")
}).min(1);

module.exports = {
  createBookSchema,
  updateBookSchema
};
