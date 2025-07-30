import { Request, NextFunction, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../middleware/errors";
import userService from "../services/userService";


async function getUser(req: Request, res: Response) {
    const userId = req.session.userId!;

    const user = await userService.getUser(userId);
    if (!user) {
        throw new UnauthorizedError("User not logged in");
    }
    res.status(200).json(user);
}

async function findUsers(req: Request, res: Response) {
    const name = req.body.name as string;
    if (!name) {
        throw new BadRequestError("Search term is required");
    }

    const users = await userService.searchUsersByName(name);
    res.status(200).json(users);
}

async function setAdmin(req: Request, res: Response) {
    const userId = req.body.userId as string;
    const isAdmin = req.body.isAdmin as boolean;
    const errors = [];

    if (!userId) {
        errors.push("User ID is required");
    }
    if (typeof isAdmin !== "boolean") {
        errors.push("isAdmin must be a boolean");
    }
    if (errors.length > 0) {
        throw new BadRequestError(errors.join(", "));
    }

    await userService.setAdmin(userId, req.fsr!, isAdmin);
    res.status(200).json({ message: "Admin status updated successfully" });
}

async function getAdmins(req: Request, res: Response) {
    const admins = await userService.getAdmins(req.fsr!);
    res.status(200).json(admins);
}

export default {
    getUser,
    findUsers,
    setAdmin,
    getAdmins,
};