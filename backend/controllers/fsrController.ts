import { Request, NextFunction, Response } from "express";
import fsrService from "../services/fsrService";
import { BadRequestError, ForbiddenError } from "../middleware/errors";
import userService from "../services/userService";

async function getFsr(req: Request, res: Response) {
    const fsr = req.fsr!;

    res.status(200).json(fsr);
}

async function getFsrs(req: Request, res: Response) {
    const fsrs = await fsrService.getAllFSRs();
    res.status(200).json(fsrs);
}

async function createFsr(req: Request, res: Response) {
    const userId = req.session.userId;
    if (!await userService.isAdmin(userId!, "gsr")) {
        throw new ForbiddenError("You must be an gsr admin to create a new FSR");
    }
    const requiredFields = ["name", "slug", "primaryColor", "secondaryColor"];
    const optionalFields = ["uforaUrl", "facebookUrl", "instagramUrl", "discordUrl", "linkedinUrl", "tiktokUrl", "githubUrl"]
    const fsrData: any = {};
    const errors: string[] = [];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            errors.push(`${field} is required`);
        } else {
            fsrData[field] = req.body[field];
        }
    }

    for (const field of optionalFields) {
        if (req.body[field]) {
            fsrData[field] = req.body[field];
        }
    }
    if (errors.length > 0) {
        throw new BadRequestError(errors.join(", "));
    }

    var fsr;
    if (req.files && Object.keys(req.files).length === 0) {
        const logo = req.files.logo
        if (!logo || logo instanceof Array) {
            throw new BadRequestError('Logo files should be named "logo" and must be a single file.');
        }

        if (!logo.mimetype.startsWith('image/')) {
            throw new BadRequestError('Logo must be an image file.');
        }
        fsr = await fsrService.createFsr(fsrData, logo);
    } else {
        fsr = await fsrService.createFsr(fsrData);
    }
    res.status(201).json(fsr);
}

async function updateFsr(req: Request, res: Response) {
    const fsrSlug = req.fsr!.slug;
    const fsrData: Partial<any> = req.body;

    if (!fsrData || Object.keys(fsrData).length === 0) {
        throw new BadRequestError("No data provided for update");
    }

    const updatedFsr = await fsrService.updateFSR(fsrSlug, fsrData);
    res.status(200).json(updatedFsr);
}

export default {
    getFsr,
    getFsrs,
    createFsr,
    updateFsr,
};