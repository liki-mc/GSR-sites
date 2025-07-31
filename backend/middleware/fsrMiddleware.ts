import { NextFunction, Request, Response } from "express";
import fsrService from "../services/fsrService";
import { type FSR } from "@prisma/client";
import { NotFoundError } from "./errors";

export async function fsrMiddleware(req: Request, res: Response, next: NextFunction) {
    const fsrSlug = req.params.fsr as string;
    if (!fsrSlug) {
        throw new NotFoundError("Page not found");
    }
    const fsr = await fsrService.getFsrBySlug(fsrSlug);

    // Attach FSR to request for further use
    req.fsr = fsr;
    next();
}

declare global {
    namespace Express {
        interface Request {
            fsr?: FSR;
        }
    }
}