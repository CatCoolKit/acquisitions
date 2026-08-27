import express from 'express';
import {
  deleteUser,
  fetchAllUsers,
  fetchUserById,
  updateUser,
} from '#controllers/users.controller.js';
import checkToken from '#middleware/auth.middleware.js';

const router = express.Router();

router.use(checkToken);

router.get('/', fetchAllUsers);
router.get('/:id', fetchUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
