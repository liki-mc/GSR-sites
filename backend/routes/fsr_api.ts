import express, { NextFunction, Request, Response } from 'express';
import userController from '../controllers/userController';
import { isAdmin } from '../middleware/authMiddleware';
const router = express.Router();

// User routes
router.get('/user/admin', isAdmin, userController.getAdmins);
router.put('/user/admin', isAdmin, userController.setAdmin);


export default router