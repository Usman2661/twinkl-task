import Joi from 'joi';

import { UserType } from '../types/user';

const userValidationSchema = Joi.object({
  fullName: Joi.string().min(1).required().messages({
    'string.empty': 'Full name is required',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .max(64)
    .regex(/[0-9]/)
    .message('Password must contain at least one digit')
    .regex(/[a-z]/)
    .message('Password must contain at least one lowercase letter')
    .regex(/[A-Z]/)
    .message('Password must contain at least one uppercase letter')
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be between 8 and 64 characters',
      'string.max': 'Password must be between 8 and 64 characters',
      'any.required': 'Password is required',
    }),
  createdAt: Joi.string()
    .pattern(
      /^(?:19|20)\d\d-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01]) (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
      'YYYY-MM-DD HH:MM:SS format',
    )
    .optional()
    .messages({
      'string.pattern.base':
        'Invalid date format. Expected YYYY-MM-DD HH:MM:SS',
    }),
  userType: Joi.string()
    .valid(...Object.values(UserType))
    .required()
    .messages({
      'any.required': 'User type is required',
      'any.only':
        'User type must be one of: student, teacher, parent, private tutor',
    }),
});

export default userValidationSchema;
