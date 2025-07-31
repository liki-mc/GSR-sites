import express, { NextFunction, Request, Response } from 'express';
import userController from '../controllers/userController';
import mediaController from '../controllers/mediaController';
import pageController from '../controllers/pageController';
import fsrController from '../controllers/fsrController';
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


// Page routes
router.get('/page/:lang(en|nl)/info/:path*', pageController.getPageInfo);
router.get('/page/info/:path*', pageController.getPageInfoWithoutLang);
router.get('/page/:lang(en|nl)/:path*', pageController.getPage);
router.get('/page/:path*', pageController.getPageWithoutLang);
router.post('/page', isAdmin, pageController.createPage);
router.patch('/page/:lang(en|nl)/:path*', isAdmin, pageController.updatePage);
router.patch('/page/content/:lang(en|nl)/:path*', isAdmin, pageController.updatePageContent);
router.delete('/page/:lang(en|nl)/:path*', isAdmin, pageController.deletePage);

// FSR routes
router.get('/info', isAdmin, fsrController.getFsr);
router.put('/info', isAdmin, fsrController.updateFsr);

export default router