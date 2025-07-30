import { NextFunction, Request, Response } from "express";
import userService from "../services/userService";
import { BadRequestError, ForbiddenError, UnauthorizedError } from "./errors";
import { isFSR } from "../services/util";

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
    const requestingUserId = req.session.userId;
    if (!requestingUserId) {
        throw new UnauthorizedError("You must be logged in to access this resource");
    }

    const fsr = req.params.fsr;
    if (!fsr) {
        throw new BadRequestError("FSR is required");
    }
    if (!isFSR(fsr)) {
        throw new BadRequestError("Invalid FSR provided");
    }

    const allowed = await userService.isAdmin(requestingUserId, fsr);
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