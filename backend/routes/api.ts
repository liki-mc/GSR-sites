import express, { NextFunction, Request, Response } from 'express';

import { isAdmin, isLoggedIn } from '../middleware/authMiddleware';
import ugentCasController from '../controllers/ugentCasController';
import { errorMiddleware } from '../middleware/errorMiddleware';

const router = express.Router();

// Login router
router.get('/login', (req: Request, res: Response) => res.redirect('./ugent-cas/login'));
router.get('/logout', (req: Request, res: Response) => res.redirect('./ugent-cas/logout'));

// UGent CAS routes
router.get('/ugent-cas/login', ugentCasController.login);
router.get('/ugent-cas/callback', ugentCasController.loginCallback);
router.get('/ugent-cas/logout', isLoggedIn, ugentCasController.logout);

router.use(errorMiddleware);

export default router;
