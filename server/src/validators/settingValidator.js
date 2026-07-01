const Joi = require("joi");

const updateSettingsSchema = Joi.object({
  libraryName: Joi.string(),
  primaryColor: Joi.string(),
  secondaryColor: Joi.string(),
  supportEmail: Joi.string().email(),
  supportPhone: Joi.string(),
  website: Joi.string().uri(),
  finePerDay: Joi.number().min(0),
  maxBorrowDays: Joi.number().min(1),
  maxBooksPerStudent: Joi.number().min(1),
  emailNotifications: Joi.boolean(),
  smsNotifications: Joi.boolean(),
  overdueReminder: Joi.boolean(),
  dueReminder: Joi.boolean(),
  customDomain: Joi.string(),
  companyName: Joi.string(),
  smtpHost: Joi.string(),
  smtpPort: Joi.number(),
  smtpEmail: Joi.string().email(),
  smtpPassword: Joi.string()
});

module.exports = { updateSettingsSchema };
