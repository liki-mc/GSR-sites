import { NextFunction, Request, Response } from "express";
import { isFSR } from "../services/util";
import { FSR } from "@prisma/client";

export async function fsrMiddleware(req: Request, res: Response, next: NextFunction) {
    const fsr = req.params.fsr as string;
    if (!fsr) {
        res.status(400).json({ error: "FSR is required" });
        return;
    }
    if (!isFSR(fsr)) {
        res.status(400).json({ error: "Invalid FSR provided" });
        return;
    }

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