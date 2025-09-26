const { RateLimiterMemory } = require('rate-limiter-flexible');

/**
 * Rate limit par adresse IP (générique)
 * @param {object} opts { points, duration }
 * - points: nombre de requêtes autorisées
 * - duration: fenêtre en secondes
 */
function rateLimitIP(opts = {}) {
  // Désactiver le rate limiting si la variable d'environnement est définie
  if (process.env.DISABLE_RATE_LIMIT === 'true') {
    return (req, res, next) => next();
  }

  const {
    points = parseInt(process.env.RATE_LIMIT_POINTS || '5', 10), // 5 req
    duration = parseInt(process.env.RATE_LIMIT_DURATION || '60', 10), // par 60s
  } = opts;

  const limiter = new RateLimiterMemory({ points, duration });

  return async (req, res, next) => {
    try {
      const key =
        req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'global';
      await limiter.consume(key);
      return next();
    } catch (rejRes) {
      return res.status(429).json({ message: 'Trop de requêtes. Réessayez plus tard.' });
    }
  };
}

/**
 * Rate limit combiné par IP + Email (ex: forgot-password)
 * - limite l'abus par IP ET par email
 */
function rateLimitIPAndEmail(opts = {}) {
  // Désactiver le rate limiting si la variable d'environnement est définie
  if (process.env.DISABLE_RATE_LIMIT === 'true') {
    return (req, res, next) => next();
  }

  const {
    ipPoints = parseInt(process.env.RATE_LIMIT_IP_POINTS || '10', 10), // 10 req par IP
    ipDuration = parseInt(process.env.RATE_LIMIT_IP_DURATION || '300', 10), // 5 min
    emailPoints = parseInt(process.env.RATE_LIMIT_EMAIL_POINTS || '3', 10), // 3 req par email
    emailDuration = parseInt(process.env.RATE_LIMIT_EMAIL_DURATION || '1800', 10), // 30 min
    emailField = 'email',
  } = opts;

  const ipLimiter = new RateLimiterMemory({ points: ipPoints, duration: ipDuration });
  const emailLimiter = new RateLimiterMemory({ points: emailPoints, duration: emailDuration });

  return async (req, res, next) => {
    const ipKey =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'global';
    const email =
      req.body && req.body[emailField] ? String(req.body[emailField]).toLowerCase().trim() : null;
    try {
      // Consommer un point pour l'IP
      await ipLimiter.consume(ipKey);

      // Consommer un point pour l'email si présent
      if (email) {
        await emailLimiter.consume(email);
      }

      return next();
    } catch (err) {
      return res.status(429).json({ message: 'Trop de requêtes. Réessayez plus tard.' });
    }
  };
}

module.exports = {
  rateLimitIP,
  rateLimitIPAndEmail,
};
