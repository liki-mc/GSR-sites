import express, { NextFunction, Request, Response } from 'express';

import { isAdmin, isLoggedIn } from '../middleware/authMiddleware';
import { errorMiddleware } from '../middleware/errorMiddleware';
import { fsrMiddleware } from '../middleware/fsrMiddleware';

import ugentCasController from '../controllers/ugentCasController';
import userController from '../controllers/userController';

import fsr_api from './fsr_api';

const router = express.Router();

router.use('/:fsr(\\d+)', fsrMiddleware, fsr_api);



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
router.get('/ugent-cas/callback', ugentCasController.loginCallback);
router.get('/ugent-cas/logout', isLoggedIn, ugentCasController.logout);

// User routes
router.use('/user{*splat}', isLoggedIn);
router.get('/user/me', userController.getUser);
router.get('/user/find', userController.findUsers);

router.use(errorMiddleware);

export default router;
