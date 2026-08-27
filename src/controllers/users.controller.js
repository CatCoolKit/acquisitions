import logger from '#config/logger.js';
import {
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from '#services/users.service.js';
import { formatValidationErrors } from '#utils/format.js';
import { updateUserSchema } from '#validations/users.validation.js';

const parseUserId = id => {
  const userId = Number.parseInt(id, 10);

  if (Number.isNaN(userId) || userId <= 0) {
    return null;
  }

  return userId;
};

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users from the database...');
    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully fetched all users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error('Error fetching all users:', error);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const userId = parseUserId(req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    logger.info(`Fetching user with id ${userId}...`);
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Successfully fetched user',
      user,
    });
  } catch (error) {
    logger.error(`Error fetching user with id ${req.params.id}:`, error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = parseUserId(req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res
        .status(400)
        .json({ error: formatValidationErrors(validationResult.error) });
    }

    const user = await updateUserById(userId, validationResult.data);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    logger.error(`Error updating user with id ${req.params.id}:`, error);

    if (error.message === 'User already exists') {
      return res
        .status(400)
        .json({ error: 'User with this email already exists' });
    }

    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = parseUserId(req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const deletedUser = await deleteUserById(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    logger.error(`Error deleting user with id ${req.params.id}:`, error);
    next(error);
  }
};
