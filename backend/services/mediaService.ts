import prisma from './prisma';
import { FSR, type Media } from '@prisma/client';
import contentService from './contentService';

import { NotFoundError } from '../middleware/errors';
import { UploadedFile } from 'express-fileupload';

interface MediaInfo {
    name: string;
    path: string;
    mimeType: string;
}

async function getMedia(fsr: FSR, path: string): Promise<Media> {
    const media = await prisma.media.findFirst({
        where: {
            fsr,
            path,
            deletedAt: null, // Ensure we only get non-deleted media
        },
    });

    if (!media) {
        throw new NotFoundError(`Media with path ${path} not found for FSR ${fsr}`);
    }

    return media;
}

async function getMediaContent(fsr: FSR, path: string): Promise<[string, string]> {
    const media = await getMedia(fsr, path);
    const content = await contentService.getContent(`media/${media.path}`);

    return [content, media.mimeType];
}

async function createMedia(fsr: FSR, file: UploadedFile): Promise<Media> {
    const media = await prisma.media.create({
        data: {
            fsr,
            name: file.name,
            path: file.name,
            mimeType: file.mimetype,
        },
    });

    // Append the media ID to the path and update the database
    const lastDotIndex = media.path.lastIndexOf('.');
    const updatedPath = `${media.path.slice(0, lastDotIndex)}-${media.id}${media.path.slice(lastDotIndex)}`;
    const updatedMedia = await prisma.media.update({
        where: { id: media.id },
        data: { path: updatedPath },
    });

    // Create an empty file for the media
    await contentService.writeContentFromFile(`media/${updatedMedia.path}`, file);

    return updatedMedia;
}

async function deleteMedia(fsr: FSR, path: string): Promise<void> {
    const media = await getMedia(fsr, path);
    
    // Delete the media file from the content directory
    await contentService.renameContent(`media/${media.path}`, `media/deleted/${media.path}`);

    // Delete the media record from the database
    await prisma.media.update({
        where: { id: media.id },
        data: { deletedAt: new Date() },
    });
}

export default {
    getMedia,
    getMediaContent,
    createMedia,
    deleteMedia,
};