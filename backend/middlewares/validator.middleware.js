const Joi = require('joi');

/**
 * Middleware générique de validation via Joi.
 * - Valide req.body contre le schéma fourni
 * - Retourne 400 en cas d'erreur avec le détail
 * - Nettoie les champs non attendus (stripUnknown)
 */
const validate = schema => (req, res, next) => {
  const options = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  };

  const { error, value } = schema.validate(req.body, options);
  if (error) {
    return res.status(400).json({
      message: 'Erreur de validation',
      details: error.details.map(d => d.message),
    });
  }
  req.body = value;
  return next();
};

/**
 * Schémas communs (OWASP-like) — Politique de mot de passe par défaut:
 * - min 12 caractères
 * - au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
 */
const passwordSchema = Joi.string()
  .min(12)
  .pattern(/[A-Z]/, 'une majuscule')
  .pattern(/[a-z]/, 'une minuscule')
  .pattern(/[0-9]/, 'un chiffre')
  .pattern(/[^A-Za-z0-9]/, 'un caractère spécial')
  .messages({
    'string.min': 'Le mot de passe doit contenir au moins 12 caractères',
    'string.pattern.name': 'Le mot de passe doit contenir au moins {#name}',
  });

const emailSchema = Joi.string().email().max(254).messages({
  'string.email': 'Email invalide',
});

const schemas = {
  // Auth
  login: Joi.object({
    email: emailSchema.required(),
    password: Joi.string().min(1).required(),
  }),

  register: Joi.object({
    firstname: Joi.string().min(2).max(100).required(),
    lastname: Joi.string().min(2).max(100).required(),
    email: emailSchema.required(),
    role: Joi.string().valid('Admin', 'Worker', 'Manager').required(),
    numberphone: Joi.string().min(6).max(20).required(),
    password: passwordSchema.required(),
    competences: Joi.array()
      .items(
        Joi.object({
          competence_id: Joi.number().integer().positive(),
          name: Joi.string().optional(),
        }),
      )
      .optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().min(1).required(),
    newPassword: passwordSchema.required(),
    confirmNewPassword: Joi.any()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({ 'any.only': 'Les mots de passe ne correspondent pas' }),
  }),

  forgotPassword: Joi.object({
    email: emailSchema.required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().min(10).required(),
    newPassword: passwordSchema.required(),
    confirmNewPassword: Joi.any()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({ 'any.only': 'Les mots de passe ne correspondent pas' }),
  }),

  // Competence
  createCompetence: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Le nom de la compétence est requis',
      'string.min': 'Le nom de la compétence doit contenir au moins 2 caractères',
      'string.max': 'Le nom de la compétence ne peut pas dépasser 100 caractères',
    }),
    description: Joi.string().max(500).optional().messages({
      'string.max': 'La description ne peut pas dépasser 500 caractères',
    }),
  }),

  updateCompetence: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.empty': 'Le nom de la compétence ne peut pas être vide',
      'string.min': 'Le nom de la compétence doit contenir au moins 2 caractères',
      'string.max': 'Le nom de la compétence ne peut pas dépasser 100 caractères',
    }),
    description: Joi.string().max(500).optional().messages({
      'string.max': 'La description ne peut pas dépasser 500 caractères',
    }),
  }),
};

module.exports = {
  validate,
  schemas,
  passwordSchema,
};
