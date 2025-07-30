import { NextFunction, Request, Response } from "express";
import { AppError } from "./errors";

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
    // If the error is an instance of AppError, use its status code and message
    if (err instanceof AppError) {
        return errorResponse(res, err.statusCode, err.message, err.errorCode);
    }

    // Only log the error stack if it's not a known AppError
    console.error(err.stack);

    // Else send a generic internal server error
    errorResponse(res, 500, "Internal Server Error");
}

function errorResponse(res: Response, status: number, message: string, code?: string) {
    res.status(status).json({message, code});
}
