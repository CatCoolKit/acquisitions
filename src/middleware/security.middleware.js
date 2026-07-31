import aj from '#config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin access granted';
        break;
      case 'user':
        limit = 10;
        message = 'User access granted';
        break;
      default:
        limit = 5;
        message = 'Guest access granted';
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    console.log({
      denied: decision.isDenied(),
      reason: decision.reason,
    });

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests are not allowed',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request blocked', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        method: req.method,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security rules',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit request blocked', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Too many requests, please try again later',
      });
    }

    next();
  } catch (error) {
    console.error('Security middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    });
  }
};

export default securityMiddleware;
