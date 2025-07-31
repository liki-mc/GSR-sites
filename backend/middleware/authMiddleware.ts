import { NextFunction, Request, Response } from "express";
import userService from "../services/userService";
import { ForbiddenError, UnauthorizedError } from "./errors";

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
    const requestingUserId = req.session.userId;
    if (!requestingUserId) {
        throw new UnauthorizedError("You must be logged in to access this resource");
    }

    const allowed = await userService.isAdmin(requestingUserId, req.fsr!.slug);
    if (!allowed) {
        throw new ForbiddenError("You are not allowed to access this resource");
    }
    next();
}

export async function isLoggedIn(req: Request, res: Response, next: NextFunction) {
    const userId = req.session.userId;
    if (!userId) {
        throw new UnauthorizedError("You must be logged in to access this resource");
    }

    next();
}