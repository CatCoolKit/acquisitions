import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-please-change';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';

export const jwttoken = {
  sign: payload => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    } catch (error) {
      logger.error(`Error signing JWT: ${error}`);
      throw new Error('Error signing JWT', { cause: error });
    }
  },
  verify: token => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error(`Error verifying JWT: ${error}`);
      throw new Error('Error verifying JWT', { cause: error });
    }
  },
  decode: token => {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error(`Error decoding JWT: ${error}`);
      throw new Error('Error decoding JWT', { cause: error });
    }
  },
};

export default jwttoken;
