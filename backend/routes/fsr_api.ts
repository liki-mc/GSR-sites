import express, { NextFunction, Request, Response } from 'express';
import userController from '../controllers/userController';
import mediaController from '../controllers/mediaController';
import { isAdmin } from '../middleware/authMiddleware';
const router = express.Router();

// User routes
router.get('/user/admin', isAdmin, userController.getAdmins);
router.put('/user/admin', isAdmin, userController.setAdmin);

// Media routes
router.get('/media/:path', mediaController.getMediaContent);
router.get('/media/info/:path', mediaController.getMediaInfo);
router.post('/media', mediaController.uploadMedia);
router.delete('/media/:path', mediaController.deleteMedia);

export default router