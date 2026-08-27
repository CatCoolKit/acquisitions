import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { hashPassword } from '#services/auth.service.js';

const publicUserFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  created_at: users.created_at,
};

export const getAllUsers = async () => {
  try {
    return await db.select(publicUserFields).from(users);
  } catch (error) {
    logger.error('Error fetching all users:', error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const result = await db
      .select(publicUserFields)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    logger.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }
};

export const updateUserById = async (id, { name, email, password, role }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return null;
    }

    if (email && email !== existingUser[0].email) {
      const emailTaken = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (emailTaken.length > 0) {
        throw new Error('User already exists');
      }
    }

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (password !== undefined) updates.password = await hashPassword(password);

    if (Object.keys(updates).length === 0) {
      return getUserById(id);
    }

    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning(publicUserFields);

    logger.info(`User updated successfully: ${result[0].email}`);
    return result[0];
  } catch (error) {
    logger.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

export const deleteUserById = async id => {
  try {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email });

    if (result.length === 0) {
      return null;
    }

    logger.info(`User deleted successfully: ${result[0].email}`);
    return result[0];
  } catch (error) {
    logger.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};
