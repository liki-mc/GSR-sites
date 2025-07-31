import { Request, NextFunction, Response } from "express";
import mediaService from "../services/mediaService";
import { BadRequestError } from "../middleware/errors";

async function getMediaInfo(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;
    if (!path) {
        throw new BadRequestError("Path is required");
    }
    const media = await mediaService.getMedia(fsr.slug, path);
    res.status(200).json(media);
}

async function getMediaContent(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;
    if (!path) {
        throw new BadRequestError("Path is required");
    }
    const [content, mimeType] = await mediaService.getMediaContent(fsr.slug, path);
    res.status(200).setHeader("Content-Type", mimeType).send(content);
}

async function uploadMedia(req: Request, res: Response) {
    const fsr = req.fsr!;

    if (!req.files || Object.keys(req.files).length === 0) {
        throw new BadRequestError('No file was uploaded.');
    }
    
    const file = req.files.file;
    if (!file) {
        throw new BadRequestError('Please upload a file with name "file".');
    }
    if (file instanceof Array) {
        const media = [];
        for (const f of file) {
            const createdMedia = await mediaService.createMedia(fsr.slug, f);
            media.push(createdMedia);
        }
    } else {
        const media = await mediaService.createMedia(fsr.slug, file);
        res.status(201).json(media);
    }
}

async function deleteMedia(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;
    if (!path) {
        throw new BadRequestError("Path is required");
    }
    await mediaService.deleteMedia(fsr.slug, path);
    res.status(204).send();
}

export default {
    getMediaInfo,
    getMediaContent,
    uploadMedia,
    deleteMedia,
};