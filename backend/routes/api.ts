import express, { NextFunction, Request, Response } from 'express';

import { isAdmin, isLoggedIn } from '../middleware/authMiddleware';
import { errorMiddleware } from '../middleware/errorMiddleware';
import { fsrMiddleware } from '../middleware/fsrMiddleware';

import ugentCasController from '../controllers/ugentCasController';
import userController from '../controllers/userController';

const router = express.Router();

// No FSR in params
router.get('/ugent-cas/callback', ugentCasController.loginCallback);

router.use(fsrMiddleware);

// Login router
router.get('/login', (req: Request, res: Response) => {
    const queryParams = new URLSearchParams(req.query as Record<string, string>).toString();
    res.redirect(`./ugent-cas/login${queryParams ? `?${queryParams}` : ''}`);
});

router.get('/logout', (req: Request, res: Response) => {
    const queryParams = new URLSearchParams(req.query as Record<string, string>).toString();
    res.redirect(`./ugent-cas/logout${queryParams ? `?${queryParams}` : ''}`);
});

// UGent CAS routes
router.get('/ugent-cas/login', ugentCasController.login);
router.get('/ugent-cas/logout', isLoggedIn, ugentCasController.logout);

// User routes
router.use('/user{*splat}', isLoggedIn);
router.get('/user/me', userController.getUser);
router.get('/user/find', userController.findUsers);
router.put('/user/admin', isAdmin, userController.setAdmin);

router.use(errorMiddleware);

export default router;
