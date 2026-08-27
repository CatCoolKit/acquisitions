import logger from '#config/logger.js';
import { cookies } from '#utils/cookies.js';
import jwttoken from '#utils/jwt.js';

export const checkToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      token = cookies.getCookie(req, 'token');
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is required',
      });
    }

    const decoded = jwttoken.verify(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.warn('Invalid or expired token', {
      path: req.path,
      method: req.method,
    });

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

export default checkToken;
